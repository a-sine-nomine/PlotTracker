package com.sinenomine.plottracker.controller;

import com.sinenomine.plottracker.model.Story;
import com.sinenomine.plottracker.model.Users;
import com.sinenomine.plottracker.service.JWTService;
import com.sinenomine.plottracker.service.StoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/story")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class HelloController {
    @Autowired
    private StoryService storyService;

    @GetMapping("")
    public ResponseEntity<?> ping(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String username = userDetails.getUsername();
        Set<Story> storyByUser = storyService.findByUser(username);
        return ResponseEntity.ok(storyByUser);
    }
}