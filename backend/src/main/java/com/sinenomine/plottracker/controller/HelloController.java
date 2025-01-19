package com.sinenomine.plottracker.controller;

import com.sinenomine.plottracker.model.Story;
import com.sinenomine.plottracker.model.Users;
import com.sinenomine.plottracker.service.JWTService;
import com.sinenomine.plottracker.service.StoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/story")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class HelloController {
    @Autowired
    private StoryService storyService;
    @Autowired
    private JWTService jwtService;

    @GetMapping("")
    public ResponseEntity<?> ping(@RequestHeader (name="Authorization") String token) {
        String username = jwtService.extractUserName(token.substring(7));
        Set<Story> storyByUser = storyService.findByUser(username);
        return ResponseEntity.ok(storyByUser);
    }
}