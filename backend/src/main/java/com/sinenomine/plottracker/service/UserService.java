package com.sinenomine.plottracker.service;

import com.sinenomine.plottracker.dto.ChangePasswordRequestDto;
import com.sinenomine.plottracker.dto.DeleteUserRequestDto;
import com.sinenomine.plottracker.dto.UserDto;
import com.sinenomine.plottracker.exception.*;
import com.sinenomine.plottracker.model.Users;
import com.sinenomine.plottracker.repo.UserRepo;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final AuthenticationManager authManager;

    private final StoryService storyService;

    public UserService(UserRepo userRepo,
                       BCryptPasswordEncoder passwordEncoder,
                       JWTService jwtService,
                       AuthenticationManager authManager,
                       StoryService storyService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authManager = authManager;
        this.storyService = storyService;
    }

    public Users register(UserDto userDto) {
        if (userRepo.findByUsername(userDto.getUsername()) != null) {
            throw new UsernameExistsException(userDto.getUsername());
        }
        Users newUser = new Users();
        newUser.setUsername(userDto.getUsername());
        newUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        userRepo.save(newUser);

        storyService.cloneDemoStoryForUser(newUser);

        return newUser;
    }

    public String authenticate(Users user) {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );
            if (authentication.isAuthenticated()) {
                return jwtService.generateToken(user.getUsername());
            }
            throw new AuthException("Authentication failed");
        } catch (Exception e) {
            throw new AuthException("Invalid username or password");
        }
    }

    public void changePassword(String username, ChangePasswordRequestDto request) {
        Users user = userRepo.findByUsername(username);
        if (user == null) {
            throw new UserNotFoundException("User not found");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);
    }

    public void deleteUser(String username, DeleteUserRequestDto request) {
        Users user = userRepo.findByUsername(username);
        if (user == null) {
            throw new UserNotFoundException("User not found");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Password is incorrect");
        }
        userRepo.delete(user);
    }

    public Users getUser(String username) {
        Users user = userRepo.findByUsername(username);
        if (user == null) {
            throw new UserNotFoundException("User not found");
        }
        user.setPassword(null);
        return user;
    }
}
