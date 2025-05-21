package com.sinenomine.plottracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sinenomine.plottracker.dto.*;
import jakarta.servlet.http.Cookie;
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

import static net.javacrumbs.jsonunit.spring.JsonUnitResultMatchers.json;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Sql(value = "/test-data.sql", executionPhase = ExecutionPhase.BEFORE_TEST_CLASS)
class TagControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Cookie jwtCookie;
    private final Long storyId = 1L;
    private Long tagTypeId = 1L;
    private Long tagId = 1L;

    @BeforeAll
    void beforeAllLogin() throws Exception {
        UserDto userDto = new UserDto();
        userDto.setUsername("TestUser1");
        userDto.setPassword("password");

        var loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("jwt"))
                .andReturn();

        Cookie[] cookies = loginResult.getResponse().getCookies();
        assertThat(cookies).isNotEmpty();

        for (Cookie c : cookies) {
            if ("jwt".equals(c.getName())) {
                this.jwtCookie = c;
                break;
            }
        }
        assertThat(jwtCookie)
                .isNotNull();
    }

    @Test
    @DisplayName("Create a Tag should return 201 Created")
    @Transactional
    @Rollback
    void testCreateTagSuccess() throws Exception {
        TagRequestDto request = new TagRequestDto();
        request.setTagName("TestTag");
        request.setColor("#123456");
        request.setTagTypeId(1L);

        mockMvc.perform(post("/api/stories/{storyId}/tags", storyId)
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tagId").exists())
                .andExpect(jsonPath("$.tagName").value("TestTag"))
                .andExpect(jsonPath("$.color").value("#123456"))
                .andExpect(jsonPath("$.tagTypeId").value(1))
                .andReturn();
    }

    @Test
    @DisplayName("Get all tags for the story should return 200 OK")
    void testGetTags() throws Exception {
        mockMvc.perform(get("/api/stories/{storyId}/tags", storyId)
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(json().isEqualTo("""
                        [
                          {
                            "tagId": 1,
                            "tagName": "Tag11",
                            "tagTypeId": 1,
                            "tagTypeName": "TagType1",
                            "color": "#D0BBFF"
                          },
                          {
                            "tagId": 2,
                            "tagName": "Tag12",
                            "tagTypeId": 1,
                            "tagTypeName": "TagType1",
                            "color": "#B8EAFF"
                          }
                        ]"""));
    }

    @Test
    @DisplayName("Get single tag should return 200 OK")
    void testGetTag() throws Exception {
        mockMvc.perform(get("/api/stories/{storyId}/tags/{tagId}", storyId, tagId)
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(json().isEqualTo("""
                        {
                          "tagId": 1,
                          "tagName": "Tag11",
                          "tagTypeId": 1,
                          "tagTypeName": "TagType1",
                          "color": "#D0BBFF"
                        }
                        """));
    }

    @Test
    @DisplayName("Update tag should return 200 OK")
    @Transactional
    @Rollback
    void testUpdateTag() throws Exception {
        TagRequestDto updateRequest = new TagRequestDto();
        updateRequest.setTagName("UpdatedTagName");
        updateRequest.setTagTypeId(2L);
        updateRequest.setColor("#ABCDEF");

        mockMvc.perform(put("/api/stories/{storyId}/tags/{tagId}", storyId, tagId)
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(json().isEqualTo("""
                        {
                          "tagId": 1,
                          "tagName": "UpdatedTagName",
                          "tagTypeId": 2,
                          "tagTypeName": "TagType2",
                          "color": "#ABCDEF"
                        }
                        """));
    }

    @Test
    @DisplayName("Delete tag should return 200 OK")
    @Transactional
    @Rollback
    void testDeleteTag() throws Exception {
        mockMvc.perform(delete("/api/stories/{storyId}/tags/{tagId}", storyId, tagId)
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(content().string("Tag deleted successfully"));
    }

    @Test
    @DisplayName("Create a new TagType should return 201 Created")
    @Transactional
    @Rollback
    void testCreateTagTypeSuccess() throws Exception {
        TagTypeRequestDto request = new TagTypeRequestDto();
        request.setName("TestTagType");

        mockMvc.perform(post("/api/stories/{storyId}/tagtypes", storyId)
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tagTypeId").exists())
                .andExpect(jsonPath("$.name").value("TestTagType"));
    }

    @Test
    @DisplayName("Get all tagTypes for the story should return 200 OK")
    void testGetTagTypes() throws Exception {
        mockMvc.perform(get("/api/stories/{storyId}/tagtypes", storyId)
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(json().isEqualTo("""
                        [
                           {
                             "tagTypeId": 1,
                             "name": "TagType1"
                           },
                           {
                             "tagTypeId": 2,
                             "name": "TagType2"
                           }
                         ]"""));
    }

    @Test
    @DisplayName("Get single TagType should return 200 OK")
    void testGetSingleTagType() throws Exception {
        mockMvc.perform(get("/api/stories/{storyId}/tagtypes/{tagTypeId}", storyId, tagTypeId)
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(json().isEqualTo("""  
                          {
                            "tagTypeId": 1,
                            "name": "TagType1"
                          }
                        """));
    }

    @Test
    @DisplayName("Update TagType should return 200 OK")
    @Transactional
    @Rollback
    void testUpdateTagType() throws Exception {
        TagTypeRequestDto updateRequest = new TagTypeRequestDto();
        updateRequest.setName("UpdatedTagTypeName");

        mockMvc.perform(put("/api/stories/{storyId}/tagtypes/{tagTypeId}", storyId, tagTypeId)
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(json().isEqualTo("""  
                          {
                            "tagTypeId": 1,
                            "name": "UpdatedTagTypeName"
                          }
                        """));
    }

    @Test
    @DisplayName("Delete TagType should return 200 OK")
    @Transactional
    @Rollback
    void testDeleteTagType() throws Exception {
        mockMvc.perform(delete("/api/stories/{storyId}/tagtypes/{tagTypeId}", storyId, tagTypeId)
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(content().string("TagType deleted successfully"));
    }
}
