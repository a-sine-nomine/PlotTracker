package com.sinenomine.plottracker.controller;

import com.sinenomine.plottracker.dto.UserDto;
import com.sinenomine.plottracker.model.Users;
import com.sinenomine.plottracker.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("register")
    public ResponseEntity<Users> register(@Valid @RequestBody UserDto userDto) {
        Users createdUser = userService.register(userDto);
        createdUser.setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PostMapping("login")
    public ResponseEntity<?> login(@RequestBody UserDto userDto, HttpServletResponse response) {
        String token = userService.authenticate(new Users(userDto.getUsername(), userDto.getPassword()));
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // todo: Set to true in production (requires HTTPS)
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);

        return ResponseEntity.ok("Login successful");
    }

    @GetMapping("validate")
    public ResponseEntity<?> validateToken(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null)
            return ResponseEntity.ok("Valid");
        else
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Token");
    }

    @GetMapping("logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // todo: Set to true in production (requires HTTPS)
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok("Logged out successfully");
    }
}
