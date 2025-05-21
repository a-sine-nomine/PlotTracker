package com.sinenomine.plottracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sinenomine.plottracker.dto.PlotEventRequestDto;
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
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.Sql.ExecutionPhase;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

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
class PlotEventControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;
    private Cookie jwtCookie;
    private Long eventId = 1L;
    private Long tagId = 1L;

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

        for (Cookie c : result.getResponse().getCookies()) {
            if ("jwt".equals(c.getName())) {
                this.jwtCookie = c;
                break;
            }
        }
        assertThat(jwtCookie).isNotNull();
    }

    @Test
    @DisplayName("GET a PlotEvent should return 200 OK with PlotEventResponseDto")
    void testGetPlotEvent() throws Exception {
        mockMvc.perform(get("/api/plotEvents/{eventId}", eventId)
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(json().isEqualTo("""
                        {
                            "inPlot": null,
                            "eventType": "dated",
                            "eventId": 1,
                            "title": "TestTitle",
                            "date": "1500.01.01",
                            "description": "TestDescription",
                            "content": "TestContent",
                            "isInPlot": null,
                            "memoryRefId": null,
                            "prevEventId": null,
                            "tags": [
                              {
                                "tagId": 1,
                                "tagName": "Tag11",
                                "tagTypeId": 1,
                                "tagTypeName": "TagType1",
                                "color": "#D0BBFF"
                              }
                            ]
                          }"""));
    }

    @Test
    @DisplayName("UPDATE a PlotEvent should return 200 OK with updated PlotEventResponseDto")
    @Transactional
    @Rollback
    void testUpdatePlotEvent() throws Exception {
        PlotEventRequestDto updateDto = new PlotEventRequestDto();
        updateDto.setEventType("dated");
        updateDto.setTitle("Updated Test Title");
        updateDto.setDate("2025.01.01");
        updateDto.setDescription("Updated Test Description");
        updateDto.setContent("Updated Test Content");
        updateDto.setInPlot(true);
        updateDto.setTags(Set.of(2L));

        mockMvc.perform(put("/api/plotEvents/{eventId}", eventId)
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(json().isEqualTo("""
                        {
                             "inPlot": true,
                             "eventType": "dated",
                             "eventId":1,
                             "title": "Updated Test Title",
                             "date": "2025.01.01",
                             "description": "Updated Test Description",
                             "content": "Updated Test Content",
                             "isInPlot": true,
                             "memoryRefId": null,
                             "prevEventId": null,
                             "tags": [
                               {
                                  "tagId": 2,
                                  "tagName": "Tag12",
                                  "tagTypeId": 1,
                                  "tagTypeName": "TagType1",
                                  "color": "#B8EAFF"
                                }
                             ]
                           }"""));
    }

    @Test
    @DisplayName("ADD a Tag to an existing PlotEvent should return 200 OK with updated PlotEventResponseDto")
    @Transactional
    @Rollback
    void testAddTagToPlotEvent() throws Exception {
        mockMvc.perform(post("/api/plotEvents/{eventId}/tag/{tagId}", eventId, tagId + 1)
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(json().isEqualTo("""
                        {
                            "inPlot": true,
                            "eventType": "dated",
                            "eventId": 1,
                            "title": "TestTitle",
                            "date": "1500.01.01",
                            "description": "TestDescription",
                            "content": "TestContent",
                            "isInPlot": true,
                            "memoryRefId": null,
                            "prevEventId": null,
                            "tags": [
                              {
                                "tagId": 2,
                                "tagName": "Tag12",
                                "tagTypeId": 1,
                                "tagTypeName": "TagType1",
                                "color": "#B8EAFF"
                              },
                              {
                                "tagId": 1,
                                "tagName": "Tag11",
                                "tagTypeId": 1,
                                "tagTypeName": "TagType1",
                                "color": "#D0BBFF"
                              }
                            ]
                          }"""));
    }

    @Test
    @DisplayName("REMOVE a Tag from an existing PlotEvent should return 200 OK with updated PlotEventResponseDto")
    @Transactional
    @Rollback
    void testRemoveTagFromPlotEvent() throws Exception {
        mockMvc.perform(delete("/api/plotEvents/{eventId}/tag/{tagId}", eventId, tagId)
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(json().isEqualTo("""
                        {
                            "inPlot": true,
                            "eventType": "dated",
                            "eventId": 1,
                            "title": "TestTitle",
                            "date": "1500.01.01",
                            "description": "TestDescription",
                            "content": "TestContent",
                            "isInPlot": true,
                            "memoryRefId": null,
                            "prevEventId": null,
                            "tags": [
                            ]
                          }"""));
    }

    @Test
    @DisplayName("DELETE a PlotEvent should return 200 OK with success message")
    @Transactional
    @Rollback
    void testDeletePlotEvent() throws Exception {
        mockMvc.perform(delete("/api/plotEvents/{eventId}", eventId)
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(content().string("Plot event deleted successfully"));
    }
}
