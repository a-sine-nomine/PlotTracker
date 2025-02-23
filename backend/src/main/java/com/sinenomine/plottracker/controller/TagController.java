package com.sinenomine.plottracker.controller;

import com.sinenomine.plottracker.dto.TagRequestDto;
import com.sinenomine.plottracker.dto.TagResponseDto;
import com.sinenomine.plottracker.dto.TagTypeRequestDto;
import com.sinenomine.plottracker.dto.TagTypeResponseDto;
import com.sinenomine.plottracker.model.Tag;
import com.sinenomine.plottracker.model.TagType;
import com.sinenomine.plottracker.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/stories/{storyId}")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class TagController {
    @Autowired
    private TagService tagService;

    // GET all tags of the story
    @GetMapping("/tags")
    public ResponseEntity<?> getTags(@AuthenticationPrincipal UserDetails userDetails,
                                     @PathVariable Long storyId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        List<TagResponseDto> tags = tagService.getTagResponses(storyId, userDetails.getUsername());
        return ResponseEntity.ok(tags);
    }

    // POST add new tag to the story's tags
    @PostMapping("/tags")
    public ResponseEntity<?> createTag(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable Long storyId,
                                       @Valid @RequestBody TagRequestDto tagRequestDto,
                                       BindingResult bindingResult) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        if (bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors());
        Tag tag = tagService.createTag(storyId, tagRequestDto, userDetails.getUsername());
        TagResponseDto tagResponseDto = new TagResponseDto(tag.getTagId(), tag.getTagName(), tag.getTagType().getTagTypeId(), tag.getTagType().getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(tagResponseDto);
    }

    // GET one tag by id
    //todo make it light
    @GetMapping("/tags/{tagId}")
    public ResponseEntity<?> getTag(@AuthenticationPrincipal UserDetails userDetails,
                                    @PathVariable Long storyId,
                                    @PathVariable Long tagId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        TagResponseDto tag = tagService.getTag(storyId, tagId, userDetails.getUsername());
        return ResponseEntity.ok(tag);
    }

    // PUT update one tag by id
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
        Tag tag = tagService.updateTag(storyId, tagId, tagRequestDto, userDetails.getUsername());
        TagResponseDto tagResponseDto = new TagResponseDto(tag.getTagId(), tag.getTagName(), tag.getTagType().getTagTypeId(), tag.getTagType().getName());
        return ResponseEntity.ok(tagResponseDto);
    }

    // DELETE one tag by id
    @DeleteMapping("/tags/{tagId}")
    public ResponseEntity<?> deleteTag(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable Long storyId,
                                       @PathVariable Long tagId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        tagService.deleteTag(storyId, tagId, userDetails.getUsername());
        return ResponseEntity.ok("Tag deleted successfully");
    }

    // GET all tagTypes of the story
    @GetMapping("/tagtypes")
    public ResponseEntity<?> getTagTypes(@AuthenticationPrincipal UserDetails userDetails,
                                         @PathVariable Long storyId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        List<TagTypeResponseDto> tagTypes = tagService.getTagTypeResponses(storyId, userDetails.getUsername());
        return ResponseEntity.ok(tagTypes);
    }

    // POST add new tagType to the story
    @PostMapping("/tagtypes")
    public ResponseEntity<?> createTagType(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable Long storyId,
                                           @Valid @RequestBody TagTypeRequestDto tagTypeRequestDto,
                                           BindingResult bindingResult) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        if (bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors());
        TagType tagType = tagService.createTagType(storyId, tagTypeRequestDto, userDetails.getUsername());
        TagTypeResponseDto tagTypeResponseDto = new TagTypeResponseDto(tagType.getTagTypeId(), tagType.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(tagTypeResponseDto);
    }

    // GET one tagType by id
    //todo make it light
    @GetMapping("/tagtypes/{tagTypeId}")
    public ResponseEntity<?> getTagType(@AuthenticationPrincipal UserDetails userDetails,
                                        @PathVariable Long storyId,
                                        @PathVariable Long tagTypeId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        TagType tagType = tagService.getTagType(storyId, tagTypeId, userDetails.getUsername());
        TagTypeResponseDto tagTypeResponseDto = new TagTypeResponseDto(tagType.getTagTypeId(), tagType.getName());
        return ResponseEntity.ok(tagTypeResponseDto);
    }

    // PUT update one tagType by id
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
        TagType tagType = tagService.updateTagType(storyId, tagTypeId, tagTypeRequestDto, userDetails.getUsername());
        TagTypeResponseDto tagTypeResponseDto = new TagTypeResponseDto(tagType.getTagTypeId(), tagType.getName());
        return ResponseEntity.ok(tagTypeResponseDto);
    }

    // DELETE one tagType by id
    @DeleteMapping("/tagtypes/{tagTypeId}")
    public ResponseEntity<?> deleteTagType(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable Long storyId,
                                           @PathVariable Long tagTypeId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        tagService.deleteTagType(storyId, tagTypeId, userDetails.getUsername());
        return ResponseEntity.ok("TagType deleted successfully");
    }
}
