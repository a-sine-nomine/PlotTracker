package com.sinenomine.plottracker.service;

import com.sinenomine.plottracker.dto.TagRequestDto;
import com.sinenomine.plottracker.dto.TagResponseDto;
import com.sinenomine.plottracker.dto.TagTypeRequestDto;
import com.sinenomine.plottracker.dto.TagTypeResponseDto;
import com.sinenomine.plottracker.exception.ResourceNotFoundException;
import com.sinenomine.plottracker.exception.UnauthorizedException;
import com.sinenomine.plottracker.model.Story;
import com.sinenomine.plottracker.model.Tag;
import com.sinenomine.plottracker.model.TagType;
import com.sinenomine.plottracker.repo.StoryRepo;
import com.sinenomine.plottracker.repo.TagRepo;
import com.sinenomine.plottracker.repo.TagTypeRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class TagService {

    private final StoryRepo storyRepo;
    private final TagRepo tagRepo;
    private final TagTypeRepo tagTypeRepo;
    private final StoryService storyService;

    public TagService(StoryRepo storyRepo, TagRepo tagRepo, TagTypeRepo tagTypeRepo, StoryService storyService) {
        this.storyRepo = storyRepo;
        this.tagRepo = tagRepo;
        this.tagTypeRepo = tagTypeRepo;
        this.storyService = storyService;
    }

    public Set<Tag> getTags(Long storyId, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        return tagRepo.findByStory(story);
    }

    public List<TagResponseDto> getTagResponses(Long storyId, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        return tagRepo.findByStoryResponses(story);
    }

    public TagResponseDto getTag(Long storyId, Long tagId, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
        if (!tag.getStory().getStoryId().equals(story.getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag");
        }
        return new TagResponseDto(tag.getTagId(), tag.getTagName(),
                tag.getTagType().getTagTypeId(),
                tag.getTagType().getName(), tag.getColor());
    }

    public Tag createTag(Long storyId, TagRequestDto tagRequestDto, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        Tag tag = new Tag();
        tag.setTagName(tagRequestDto.getTagName());
        TagType tagType = tagTypeRepo.findById(tagRequestDto.getTagTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("TagType not found"));
        if (!tagType.getStory().getStoryId().equals(story.getStoryId()))
            throw new UnauthorizedException("Unauthorized access to tag type");
        tag.setTagType(tagType);
        tag.setStory(story);
        tag.setColor(tagRequestDto.getColor());
        return tagRepo.save(tag);
    }

    public Tag updateTag(Long storyId, Long tagId, TagRequestDto tagRequestDto, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
        if (!tag.getStory().getStoryId().equals(story.getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag");
        }
        tag.setTagName(tagRequestDto.getTagName());
        TagType tagType = tagTypeRepo.findById(tagRequestDto.getTagTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("TagType not found"));
        if (!tagType.getStory().getStoryId().equals(story.getStoryId()))
            throw new UnauthorizedException("Unauthorized access to tag type");
        tag.setTagType(tagType);
        tag.setColor(tagRequestDto.getColor());
        return tagRepo.save(tag);
    }

    public void deleteTag(Long storyId, Long tagId, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
        if (!tag.getStory().getStoryId().equals(story.getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag");
        }
        tagRepo.delete(tag);
    }

    public List<TagTypeResponseDto> getTagTypeResponses(Long storyId, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        return tagTypeRepo.findByStoryResponses(story);
    }

    public TagType getTagType(Long storyId, Long tagTypeId, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        TagType tagType = tagTypeRepo.findById(tagTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("TagType not found"));
        if (!tagType.getStory().getStoryId().equals(story.getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag type");
        }
        return tagType;
    }

    public TagType createTagType(Long storyId, TagTypeRequestDto tagTypeRequestDto, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        TagType tagType = new TagType();
        tagType.setName(tagTypeRequestDto.getName());
        tagType.setStory(story);
        return tagTypeRepo.save(tagType);
    }

    public TagType updateTagType(Long storyId, Long tagTypeId, TagTypeRequestDto tagTypeRequestDto, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        TagType tagType = tagTypeRepo.findById(tagTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("TagType not found"));
        if (!tagType.getStory().getStoryId().equals(story.getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag type");
        }
        tagType.setName(tagTypeRequestDto.getName());
        return tagTypeRepo.save(tagType);
    }

    public void deleteTagType(Long storyId, Long tagTypeId, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        TagType tagType = tagTypeRepo.findById(tagTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("TagType not found"));
        if (!tagType.getStory().getStoryId().equals(story.getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag type");
        }
        tagTypeRepo.delete(tagType);
    }
}
