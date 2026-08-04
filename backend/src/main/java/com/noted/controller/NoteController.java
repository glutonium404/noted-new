package com.noted.controller;

import com.noted.dto.NoteAskRequest;
import com.noted.dto.NoteAskResponse;
import com.noted.dto.NoteRequest;
import com.noted.dto.NoteResponse;
import com.noted.dto.NoteSummaryResponse;
import com.noted.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * There's no session/token in this project. Every request here must carry
 * an X-User-Email header identifying the logged-in user — the frontend
 * attaches it automatically once someone has logged in or registered.
 */
@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private static final String USER_HEADER = "X-User-Email";

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public ResponseEntity<List<NoteResponse>> getNotes(
            @RequestHeader(value = USER_HEADER, required = false) String userEmail) {
        return ResponseEntity.ok(noteService.getNotes(userEmail));
    }

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(
            @RequestHeader(value = USER_HEADER, required = false) String userEmail,
            @Valid @RequestBody NoteRequest request) {
        NoteResponse created = noteService.createNote(userEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteResponse> updateNote(
            @RequestHeader(value = USER_HEADER, required = false) String userEmail,
            @PathVariable String id,
            @Valid @RequestBody NoteRequest request) {
        return ResponseEntity.ok(noteService.updateNote(userEmail, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(
            @RequestHeader(value = USER_HEADER, required = false) String userEmail,
            @PathVariable String id) {
        noteService.deleteNote(userEmail, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/summarize")
    public ResponseEntity<NoteSummaryResponse> summarizeNote(
            @RequestHeader(value = USER_HEADER, required = false) String userEmail,
            @PathVariable String id) {
        NoteSummaryResponse summary = noteService.summarizeNote(userEmail, id);
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/{id}/ask")
    public ResponseEntity<NoteAskResponse> askAiAboutNote(
            @RequestHeader(value = USER_HEADER, required = false) String userEmail,
            @PathVariable String id,
            @Valid @RequestBody NoteAskRequest request) {
        return ResponseEntity.ok(noteService.askAiAboutNote(userEmail, id, request.getQuestion()));
    }
}
