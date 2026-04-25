package controller;  

import entity.User;
import repository.MultiRegionUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final MultiRegionUserRepository repo;

    public UserController(MultiRegionUserRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(repo.findAll());
    }
}