package com.noted.service;

import com.noted.dto.NoteRequest;
import com.noted.dto.NoteResponse;
import com.noted.dto.NoteAskResponse;
import com.noted.dto.NoteSummaryResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.noted.exception.ApiException;
import com.noted.model.Note;
import com.noted.model.User;
import com.noted.repository.NoteRepository;
import com.noted.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;
import java.util.UUID;

/**
 * There's no session/token in this project, so every note request must
 * identify the acting user some other way. The frontend sends the logged-in
 * user's email on the X-User-Email header of every /api/notes request;
 * {@link #currentUser} resolves that into a real user record (or rejects
 * the request with 401 if it's missing/unknown).
 */
@Service
public class NoteService {

    private static final String GEMINI_MODEL = "gemini-3.1-flash-lite";
    private static final List<String> PRESET_COLORS = List.of(
            "#baff29", "#5eead4", "#60a5fa", "#f9a8d4", "#fbbf24", "#c4b5fd", "#fb923c", "#a3e635");
    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String geminiApiKey;
    private final HttpClient httpClient;

    public NoteService(
            UserRepository userRepository,
            NoteRepository noteRepository,
            @Value("${gemini.api.key:}") String geminiApiKey) {
            this.userRepository = userRepository;
            this.noteRepository = noteRepository;
            this.geminiApiKey = geminiApiKey;
            this.httpClient = HttpClient.newHttpClient();
            }

    private User currentUser(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "not_logged_in", "You need to log in first.");
        }
        return userRepository.findByEmailIgnoreCase(userEmail.trim().toLowerCase())
            .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED, "not_logged_in", "You need to log in first."));
    }

    public List<NoteResponse> getNotes(String userEmail) {
        User user = currentUser(userEmail);
        return noteRepository.findByUserOrderByCreatedAtAsc(user).stream().map(NoteResponse::from).toList();
    }

    public NoteResponse createNote(String userEmail, NoteRequest request) {
        User user = currentUser(userEmail);
        List<String> tags = normalizeTags(request.getTags());
        String color = normalizeColor(request.getColor());
        if (color == null) {
            color = randomPresetColor();
        }

        Note note = new Note(
                UUID.randomUUID().toString(),
                request.getTitle().trim(),
                request.getBody().trim(),
                Instant.now().toString(),
                null,
                tags,
                color);
        note.setUser(user);

        noteRepository.save(note);
        return NoteResponse.from(note);
    }

    public NoteResponse updateNote(String userEmail, String noteId, NoteRequest request) {
        User user = currentUser(userEmail);
        Note note = findNote(user, noteId);

        note.setTitle(request.getTitle().trim());
        note.setBody(request.getBody().trim());
        note.setTags(normalizeTags(request.getTags()));
        String nextColor = normalizeColor(request.getColor());
        if (nextColor == null) {
            nextColor = note.getColor() == null || note.getColor().isBlank() ? randomPresetColor() : note.getColor();
        }
        note.setColor(nextColor);
        note.setUpdatedAt(Instant.now().toString());

        noteRepository.save(note);
        return NoteResponse.from(note);
    }

    public void deleteNote(String userEmail, String noteId) {
        User user = currentUser(userEmail);
        Note note = findNote(user, noteId);
        noteRepository.delete(note);
    }

    public NoteSummaryResponse summarizeNote(String userEmail, String noteId) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "gemini_key_missing", "Gemini API key is not configured on the server.");
        }

        User user = currentUser(userEmail);
        Note note = findNote(user, noteId);

        String body = note.getBody();
        if (body == null || body.isBlank()) {
            return new NoteSummaryResponse("");
        }

        String prompt = """
            Summarize the following note in 4-6 concise sentences.
            Return only plain summary text, no markdown, no bullet points, no title.

            Note title: %s
            Note body:
            %s
            """.formatted(note.getTitle(), body);
        return new NoteSummaryResponse(callGemini(prompt));
    }

    public NoteAskResponse askAiAboutNote(String userEmail, String noteId, String question) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "gemini_key_missing", "Gemini API key is not configured on the server.");
        }

        User user = currentUser(userEmail);
        Note note = findNote(user, noteId);

        String prompt = """
            You are helping with one specific note.
            Answer the user's question using only the note contents below.
            Ignore questions that are not related to the the note content.
            If the asked question is irrelevant to the note content, or provide no significance, crealy say so.
            Return plain text only. Format/Beautify the response using plain text/symbols/special characters as markdown is not supported.

            Note title: %s
            Note body:
            %s

            User question:
            %s
            """.formatted(note.getTitle(), note.getBody(), question.trim());
        return new NoteAskResponse(callGemini(prompt));
    }

    private Note findNote(User user, String noteId) {
        return noteRepository.findByIdAndUser(noteId, user)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "note_not_found", "Note not found."));
    }

    private String callGemini(String prompt) {
        try {
            JsonNode payload = objectMapper.createObjectNode()
                    .set("contents", objectMapper.createArrayNode().add(
                            objectMapper.createObjectNode()
                                    .set("parts", objectMapper.createArrayNode().add(
                                            objectMapper.createObjectNode().put("text", prompt)
                                    ))
                    ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(
                            "https://generativelanguage.googleapis.com/v1beta/models/"
                                    + GEMINI_MODEL
                                    + ":generateContent?key="
                                    + geminiApiKey.trim()))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                System.err.println("Gemini API Error [" + response.statusCode() + "]: " + response.body());
                throw new ApiException(
                        HttpStatus.BAD_GATEWAY,
                        "gemini_request_failed",
                        "AI summarization failed. Please try again.");
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            String summary = textNode.isMissingNode() ? "" : textNode.asText("").trim();
            if (summary.isBlank()) {
                throw new ApiException(
                        HttpStatus.BAD_GATEWAY,
                        "gemini_empty_response",
                        "AI returned an empty response.");
            }
            return summary;
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            System.err.println("Gemini API Exception: " + ex.getMessage());
            throw new ApiException(
                    HttpStatus.BAD_GATEWAY,
                    "gemini_request_failed",
                    "AI summarization failed. Please try again.");
        }
    }

    private List<String> normalizeTags(List<String> rawTags) {
        if (rawTags == null || rawTags.isEmpty()) {
            return List.of();
        }

        LinkedHashSet<String> deduped = new LinkedHashSet<>();
        for (String raw : rawTags) {
            if (raw == null) {
                continue;
            }
            String tag = raw.trim().toLowerCase(Locale.ROOT);
            if (tag.isBlank()) {
                continue;
            }
            if (tag.contains(" ")) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "validation_error", "tag must be a single word");
            }
            if (tag.length() > 20) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "validation_error", "tag must be 20 characters or fewer");
            }
            deduped.add(tag);
        }
        return new ArrayList<>(deduped);
    }

    private String normalizeColor(String rawColor) {
        if (rawColor == null || rawColor.isBlank()) {
            return null;
        }
        String color = rawColor.trim();
        if (!color.matches("^#[0-9a-fA-F]{6}$")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "validation_error", "color must be a 6-digit hex like #baff29");
        }
        return color.toLowerCase(Locale.ROOT);
    }

    private String randomPresetColor() {
        return PRESET_COLORS.get(ThreadLocalRandom.current().nextInt(PRESET_COLORS.size()));
    }
}
