package com.noted.repository;

import com.noted.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Spring Data JPA repository backed by the "users" table in SQLite.
 * Spring generates the implementation of everything below at startup —
 * there's no hand-written file I/O anymore.
 */
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUsernameIgnoreCase(String username);
}
