package com.example.quizit.features.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByemail(String email);

    Optional<User> findByEmail(String email);
    List<User> findAll();
    List<User> findByRoles_Name(String name);
    List<User> findAllByemail(String email);
    Optional<User> findById(UUID id);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.status = :status")
    List<User> findAllByRoleNameAndStatus(
            @Param("roleName") String roleName,
            @Param("status") UserStatus status
    );
}
