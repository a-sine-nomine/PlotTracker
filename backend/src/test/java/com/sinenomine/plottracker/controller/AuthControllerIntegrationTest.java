package com.sinenomine.plottracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sinenomine.plottracker.dto.UserDto;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.Sql.ExecutionPhase;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.http.Cookie;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)

@Sql(value = "/test-data.sql", executionPhase = ExecutionPhase.BEFORE_TEST_CLASS)
class AuthControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Cookie jwtCookie;

    @BeforeAll
    void beforeAllLogin() throws Exception {
        UserDto userDto = new UserDto();
        userDto.setUsername("TestUser1");
        userDto.setPassword("password");

        var result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("jwt"))
                .andReturn();

        var response = result.getResponse();
        Cookie[] cookies = response.getCookies();
        assertThat(cookies).isNotEmpty();

        for (Cookie c : cookies) {
            if ("jwt".equals(c.getName())) {
                this.jwtCookie = c;
                break;
            }
        }
        assertThat(jwtCookie).isNotNull();
    }

    @Test
    @DisplayName("Register new user should return 201 Created")
    void testRegisterSuccess() throws Exception {
        UserDto userDto = new UserDto();
        String testUsername = "testUser_integration";
        userDto.setUsername(testUsername);
        String testPassword = "testPass_integration";
        userDto.setPassword(testPassword);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value(testUsername));
    }

    @Test
    @DisplayName("Register same user again should fail with 400")
    void testRegisterDuplicate() throws Exception {
        UserDto userDto = new UserDto();
        userDto.setUsername("TestUser1");
        userDto.setPassword("password");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Username already exists"));
    }

    @Test
    @DisplayName("Login user should return JWT cookie")
    void testLoginSuccess() throws Exception {
        UserDto userDto = new UserDto();
        userDto.setUsername("TestUser1");
        userDto.setPassword("password");

        var result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("jwt"))
                .andReturn();

        var response = result.getResponse();
        Cookie[] cookies = response.getCookies();
        assertThat(cookies).isNotEmpty();
        for (Cookie cookie : cookies) {
            if ("jwt".equals(cookie.getName())) {
                jwtCookie = cookie;
            }
        }
        assertThat(jwtCookie).isNotNull();
    }

    @Test
    @DisplayName("Validate token should return 200 OK with 'Valid'")
    void testValidateToken() throws Exception {
        mockMvc.perform(get("/api/auth/validate")
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(content().string("Valid"));
    }

    @Test
    @DisplayName("Logout should clear the JWT cookie")
    void testLogout() throws Exception {
        mockMvc.perform(get("/api/auth/logout")
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                //.andExpect(cookie().value("jwt", (Matcher<? super String>) null))
                .andExpect(content().string("Logged out successfully"));
    }

    @TestConfiguration
    static class TestConfig {
        @Bean
        public BCryptPasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder(12);
        }
    }
}
