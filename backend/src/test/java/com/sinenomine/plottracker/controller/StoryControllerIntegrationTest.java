package com.sinenomine.plottracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sinenomine.plottracker.dto.StoryRequestDto;
import com.sinenomine.plottracker.dto.PlotEventRequestDto;
import com.sinenomine.plottracker.dto.UserDto;
import com.sinenomine.plottracker.model.Story;
import com.sinenomine.plottracker.repo.StoryRepo;
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
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.http.Cookie;

import java.util.Set;

import static net.javacrumbs.jsonunit.spring.JsonUnitResultMatchers.json;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Sql(value = "/test-data.sql", executionPhase = ExecutionPhase.BEFORE_TEST_CLASS)
class StoryControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StoryRepo storyRepo;
    private Cookie jwtCookie;
    private Long storyId = 1L;

    @BeforeAll
    void loginOnce() throws Exception {
        UserDto userDto = new UserDto();
        userDto.setUsername("TestUser1");
        userDto.setPassword("password");

        var result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("jwt"))
                .andReturn();

        for (Cookie c : result.getResponse().getCookies()) {
            if ("jwt".equals(c.getName())) {
                this.jwtCookie = c;
                break;
            }
        }
        assertThat(jwtCookie).isNotNull();
    }

    @Test
    @DisplayName("GET all user stories should return 200 OK with array of StoryResponseDto")
    void testGetAllStories() throws Exception {
        mockMvc.perform(get("/api/stories")
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(json().isEqualTo("""
                        [
                          {
                            "storyId": 1,
                            "title": "TestTitle",
                            "description": "TestDescription"
                          }
                        ]"""));
    }

    @Test
    @DisplayName("Create a new Story should return 201 Created with StoryResponseDto")
    @Transactional
    @Rollback
    void testCreateNewStory() throws Exception {
        StoryRequestDto request = new StoryRequestDto();
        request.setTitle("TestTitle2");
        request.setDescription("TestDescription2");

        var mvcResult = mockMvc.perform(post("/api/stories")
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.storyId").exists())
                .andExpect(jsonPath("$.title").value("TestTitle2"))
                .andExpect(jsonPath("$.description").value("TestDescription2"))
                .andReturn();

        String responseJson = mvcResult.getResponse().getContentAsString();
        Story createdStory = objectMapper.readValue(responseJson, Story.class);
        Long createdStoryId = createdStory.getStoryId();
        assertThat(createdStoryId).isNotNull();

        //todo check db in tests
        Story storyInDb = storyRepo.findById(createdStoryId).orElse(null);
        assertThat(storyInDb).isNotNull();
        assertThat(storyInDb.getTitle()).isEqualTo("TestTitle2");
        assertThat(storyInDb.getDescription()).isEqualTo("TestDescription2");
    }

    @Test
    @DisplayName("GET details of a specific story should return 200 OK with StoryResponseDto")
    void testGetStoryDetails() throws Exception {
        mockMvc.perform(get("/api/stories/{id}", storyId)
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(json().isEqualTo("""
                        {
                          "storyId": 1,
                          "title": "TestTitle",
                          "description": "TestDescription",
                          "user":null
                        }"""));
    }

    @Test
    @DisplayName("Update a story should return 200 OK with updated StoryResponseDto")
    @Transactional
    @Rollback
    void testUpdateStory() throws Exception {
        StoryRequestDto updateRequest = new StoryRequestDto();
        updateRequest.setTitle("Updated Test Title");
        updateRequest.setDescription("Updated Test Description");

        mockMvc.perform(put("/api/stories/{id}", storyId)
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(json().isEqualTo("""
                        {
                          "storyId": 1,
                          "title": "Updated Test Title",
                          "description": "Updated Test Description",
                          "user":null
                        }"""));
    }

    @Test
    @DisplayName("GET all plot events for a story, sorted by date should return 200 OK with array of plotEventResponseDto")
    void testGetPlotEvents() throws Exception {
        PlotEventRequestDto plotEventRequest = new PlotEventRequestDto();
        plotEventRequest.setEventType("dated");
        plotEventRequest.setTitle("Test Event 2");
        plotEventRequest.setDate("2025-05-01");
        plotEventRequest.setDescription("This is a test event");
        plotEventRequest.setContent("Some content");
        plotEventRequest.setTags(Set.of());

        mockMvc.perform(post("/api/stories/{id}/plotevents", storyId)
                .cookie(jwtCookie)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(plotEventRequest)));

        PlotEventRequestDto plotEventRequest2 = new PlotEventRequestDto();
        plotEventRequest2.setEventType("dated");
        plotEventRequest2.setTitle("Test Event 3");
        plotEventRequest2.setDate("2025-03-01");
        plotEventRequest2.setDescription("This is a test event 3");
        plotEventRequest2.setContent("Some content 3");
        plotEventRequest2.setTags(Set.of());

        mockMvc.perform(post("/api/stories/{id}/plotevents", storyId)
                .cookie(jwtCookie)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(plotEventRequest2)));

        mockMvc.perform(get("/api/stories/{id}/plotevents?sortBy={sortBy}", storyId, "date")
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(json().isEqualTo("""
                        [
                          {
                            "eventType": "dated",
                            "eventId": 1,
                            "title": "TestTitle",
                            "date": "1500.01.01",
                            "description": "TestDescription",
                            "content": "TestContent",
                            "memoryRefId": null,
                            "nextEventId": null,
                            "tags": [
                              {
                                "tagId": 1,
                                "tagName": "Tag11",
                                "tagTypeId": 1,
                                "tagTypeName": "TagType1",
                                "color": "#D0BBFF"
                              }
                            ]
                          },
                          {
                            "eventType": "dated",
                            "eventId": 3,
                            "title": "Test Event 2",
                            "date": "2025-05-01",
                            "description": "This is a test event",
                            "content": "Some content",
                            "memoryRefId": null,
                            "nextEventId": null,
                            "tags": []
                          },
                          {
                            "eventType": "dated",
                            "eventId": 4,
                            "title": "Test Event 3",
                            "date": "2025-03-01",
                            "description": "This is a test event 3",
                            "content": "Some content 3",
                            "memoryRefId": null,
                            "nextEventId": null,
                            "tags": []
                          }
                        ]"""));
    }

    @Test
    @DisplayName("Add a new plot event to a story should return 201 Created with PlotEventResponseDto")
    @Transactional
    @Rollback
    void testAddPlotEvent() throws Exception {
        PlotEventRequestDto plotEventRequest = new PlotEventRequestDto();
        plotEventRequest.setEventType("dated");
        plotEventRequest.setTitle("Test Event 2");
        plotEventRequest.setDate("2025-05-01");
        plotEventRequest.setDescription("This is a test event");
        plotEventRequest.setContent("Some content");
        plotEventRequest.setTags(Set.of());

        mockMvc.perform(post("/api/stories/{id}/plotevents", storyId)
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(plotEventRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.eventId").exists())
                .andExpect(jsonPath("$.eventType").value("dated"))
                .andExpect(jsonPath("$.title").value("Test Event 2"))
                .andExpect(jsonPath("$.date").value("2025-05-01"))
                .andExpect(jsonPath("$.description").value("This is a test event"))
                .andExpect(jsonPath("$.content").value("Some content"));
    }

    @Test
    @DisplayName("Delete a story should return 200 OK")
    @Transactional
    @Rollback
    void testDeleteStory() throws Exception {
        mockMvc.perform(delete("/api/stories/{id}", storyId)
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(content().string("Story deleted successfully"));
    }

    @TestConfiguration
    static class TestConfig {
        @Bean
        public BCryptPasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder(12);
        }
    }
}
