package com.sinenomine.plottracker.controller;

import com.sinenomine.plottracker.dto.ChangePasswordRequestDto;
import com.sinenomine.plottracker.dto.DeleteUserRequestDto;
import com.sinenomine.plottracker.model.Users;
import com.sinenomine.plottracker.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangePasswordRequestDto request) {

        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");

        userService.changePassword(userDetails.getUsername(), request);

        return ResponseEntity.ok("Password updated successfully");
    }

    @DeleteMapping("")
    public ResponseEntity<?> deleteUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody DeleteUserRequestDto request) {

        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");

        userService.deleteUser(userDetails.getUsername(), request);
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("")
    public ResponseEntity<?> getUser(@AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");

        Users user = userService.getUser(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }
}
