package com.sinenomine.plottracker.service;

import com.sinenomine.plottracker.dto.UserDto;
import com.sinenomine.plottracker.model.Users;
import com.sinenomine.plottracker.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private JWTService jwtService;

    @Autowired
    AuthenticationManager authManager;

    @Autowired
    private UserRepo repo;


    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public Users register(UserDto userDto) {
        if (repo.findByUsername(userDto.getUsername()) != null) {
            throw new RuntimeException("Username already exists");
        }

        Users newUser = new Users();
        newUser.setUsername(userDto.getUsername());
        newUser.setPassword(encoder.encode(userDto.getPassword()));
        repo.save(newUser);
        return newUser;
    }

    public String verify(Users user) {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );
            if (authentication.isAuthenticated()) {
                return jwtService.generateToken(user.getUsername());
            } else {
                throw new RuntimeException("Authentication failed");
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid username or password");
        }
    }
}