package com.noted.repository;

import com.noted.model.Note;
import com.noted.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, String> {

    // createdAt is stored as an ISO-8601 string (Instant.toString()), which
    // sorts lexicographically the same as chronologically — so ordering by
    // the string gives oldest-first, matching the old JSON array order.
    List<Note> findByUserOrderByCreatedAtAsc(User user);

    Optional<Note> findByIdAndUser(String id, User user);
}
