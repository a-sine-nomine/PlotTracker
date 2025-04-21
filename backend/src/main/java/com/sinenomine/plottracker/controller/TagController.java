package com.sinenomine.plottracker.controller;

import com.sinenomine.plottracker.dto.*;
import com.sinenomine.plottracker.model.Tag;
import com.sinenomine.plottracker.model.TagType;
import com.sinenomine.plottracker.service.TagService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories/{storyId}")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    // GET all tags for the story
    @GetMapping("/tags")
    public ResponseEntity<?> getTags(@AuthenticationPrincipal UserDetails userDetails,
                                     @PathVariable Long storyId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        List<TagResponseDto> tags = tagService.getTagResponses(storyId, userDetails.getUsername());
        return ResponseEntity.ok(tags);
    }

    // POST create a new tag
    @PostMapping("/tags")
    public ResponseEntity<?> createTag(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable Long storyId,
                                       @Valid @RequestBody TagRequestDto tagRequestDto,
                                       BindingResult bindingResult) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        if (bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors());
        Tag createdTag = tagService.createTag(storyId, tagRequestDto, userDetails.getUsername());
        TagResponseDto responseDto = new TagResponseDto(
                createdTag.getTagId(),
                createdTag.getTagName(),
                createdTag.getTagType().getTagTypeId(),
                createdTag.getTagType().getName(),
                createdTag.getColor()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    // GET a specific tag by id
    @GetMapping("/tags/{tagId}")
    public ResponseEntity<?> getTag(@AuthenticationPrincipal UserDetails userDetails,
                                    @PathVariable Long storyId,
                                    @PathVariable Long tagId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        TagResponseDto responseDto = tagService.getTag(storyId, tagId, userDetails.getUsername());
        return ResponseEntity.ok(responseDto);
    }

    // PUT update a tag by id
    @PutMapping("/tags/{tagId}")
    public ResponseEntity<?> updateTag(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable Long storyId,
                                       @PathVariable Long tagId,
                                       @Valid @RequestBody TagRequestDto tagRequestDto,
                                       BindingResult bindingResult) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        if (bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors());
        Tag updatedTag = tagService.updateTag(storyId, tagId, tagRequestDto, userDetails.getUsername());
        TagResponseDto responseDto = new TagResponseDto(
                updatedTag.getTagId(),
                updatedTag.getTagName(),
                updatedTag.getTagType().getTagTypeId(),
                updatedTag.getTagType().getName(),
                updatedTag.getColor()
        );
        return ResponseEntity.ok(responseDto);
    }

    // DELETE a tag by id
    @DeleteMapping("/tags/{tagId}")
    public ResponseEntity<?> deleteTag(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable Long storyId,
                                       @PathVariable Long tagId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        tagService.deleteTag(storyId, tagId, userDetails.getUsername());
        return ResponseEntity.ok("Tag deleted successfully");
    }

    // GET all tag types for the story
    @GetMapping("/tagtypes")
    public ResponseEntity<?> getTagTypes(@AuthenticationPrincipal UserDetails userDetails,
                                         @PathVariable Long storyId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        List<TagTypeResponseDto> tagTypes = tagService.getTagTypeResponses(storyId, userDetails.getUsername());
        return ResponseEntity.ok(tagTypes);
    }

    // POST create a new tag type
    @PostMapping("/tagtypes")
    public ResponseEntity<?> createTagType(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable Long storyId,
                                           @Valid @RequestBody TagTypeRequestDto tagTypeRequestDto,
                                           BindingResult bindingResult) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        if (bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors());
        TagType createdTagType = tagService.createTagType(storyId, tagTypeRequestDto, userDetails.getUsername());
        TagTypeResponseDto responseDto = new TagTypeResponseDto(
                createdTagType.getTagTypeId(),
                createdTagType.getName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    // GET a specific tag type by id
    @GetMapping("/tagtypes/{tagTypeId}")
    public ResponseEntity<?> getTagType(@AuthenticationPrincipal UserDetails userDetails,
                                        @PathVariable Long storyId,
                                        @PathVariable Long tagTypeId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        TagType tagType = tagService.getTagType(storyId, tagTypeId, userDetails.getUsername());
        TagTypeResponseDto responseDto = new TagTypeResponseDto(
                tagType.getTagTypeId(),
                tagType.getName()
        );
        return ResponseEntity.ok(responseDto);
    }

    // PUT update a tag type by id
    @PutMapping("/tagtypes/{tagTypeId}")
    public ResponseEntity<?> updateTagType(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable Long storyId,
                                           @PathVariable Long tagTypeId,
                                           @Valid @RequestBody TagTypeRequestDto tagTypeRequestDto,
                                           BindingResult bindingResult) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        if (bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors());
        TagType updatedTagType = tagService.updateTagType(storyId, tagTypeId, tagTypeRequestDto, userDetails.getUsername());
        TagTypeResponseDto responseDto = new TagTypeResponseDto(
                updatedTagType.getTagTypeId(),
                updatedTagType.getName()
        );
        return ResponseEntity.ok(responseDto);
    }

    // DELETE a tag type by id
    @DeleteMapping("/tagtypes/{tagTypeId}")
    public ResponseEntity<?> deleteTagType(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable Long storyId,
                                           @PathVariable Long tagTypeId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        tagService.deleteTagType(storyId, tagTypeId, userDetails.getUsername());
        return ResponseEntity.ok("TagType deleted successfully");
    }

    // GET a specific character tag
    @GetMapping("/tags/character/{tagId}")
    public ResponseEntity<?> getCharacterTag(@AuthenticationPrincipal UserDetails userDetails,
                                             @PathVariable Long storyId,
                                             @PathVariable Long tagId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        CharacterResponseDto responseDto = tagService.getCharacterTag(storyId, tagId, userDetails.getUsername());
        return ResponseEntity.ok(responseDto);
    }

    // PUT update a character tag
    @PutMapping("/tags/character/{tagId}")
    public ResponseEntity<?> updateCharacterTag(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable Long storyId,
                                       @PathVariable Long tagId,
                                       @Valid @RequestBody CharacterRequestDto characterRequestDto,
                                       BindingResult bindingResult) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        if (bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors());

        CharacterResponseDto responseDto = tagService.updateCharacterTag(storyId, tagId, characterRequestDto, userDetails.getUsername());
        return ResponseEntity.ok(responseDto);
    }
}
