package com.sinenomine.plottracker.service;

import com.sinenomine.plottracker.dto.*;
import com.sinenomine.plottracker.exception.ResourceNotFoundException;
import com.sinenomine.plottracker.exception.UnauthorizedException;
import com.sinenomine.plottracker.model.Story;
import com.sinenomine.plottracker.model.Tag;
import com.sinenomine.plottracker.model.Character;
import com.sinenomine.plottracker.model.TagType;
import com.sinenomine.plottracker.repo.*;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Service
public class TagService {

    private final StoryRepo storyRepo;
    private final TagRepo tagRepo;
    private final CharacterRepo characterRepo;
    private final TagTypeRepo tagTypeRepo;
    private final PlotEventRepo plotEventRepo;
    private final StoryService storyService;

    public TagService(StoryRepo storyRepo, TagRepo tagRepo, CharacterRepo characterRepo, TagTypeRepo tagTypeRepo, PlotEventRepo plotEventRepo, StoryService storyService) {
        this.storyRepo = storyRepo;
        this.tagRepo = tagRepo;
        this.tagTypeRepo = tagTypeRepo;
        this.plotEventRepo = plotEventRepo;
        this.storyService = storyService;
        this.characterRepo = characterRepo;
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
        Tag save = tagRepo.save(tag);

        if (tagType.getName().equals("Character")) {
            Character character = new Character();
            character.setTag(save);
            characterRepo.save(character);
        }
        return save;
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

    @Transactional
    public void deleteTag(Long storyId, Long tagId, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
        if (!tag.getStory().getStoryId().equals(story.getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag");
        }
        plotEventRepo.deletePlotEventTagByTagId(tagId);
        if (tag.getTagType().getName().equals("Character")) {
            characterRepo.deleteByTag_TagId(tagId);
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

    @Transactional
    public void deleteTagType(Long storyId, Long tagTypeId, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        TagType tagType = tagTypeRepo.findById(tagTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("TagType not found"));
        if (!tagType.getStory().getStoryId().equals(story.getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag type");
        }
        tagRepo.deleteByTagType_TagTypeId(tagTypeId);
        tagTypeRepo.delete(tagType);
    }

    public CharacterResponseDto getCharacterTag(Long storyId, Long tagId, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
        if (!tag.getStory().getStoryId().equals(story.getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag");
        }
        Character character = characterRepo.findByTag_TagId(tagId);
        return new CharacterResponseDto(character.getCharacterId(), tag.getTagName(), character.getShortDescription(), character.getDescription());
    }

    public CharacterResponseDto updateCharacterTag(Long storyId, Long tagId, CharacterRequestDto characterRequestDto, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
        if (!tag.getStory().getStoryId().equals(story.getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag");
        }
        tag.setTagName(characterRequestDto.getName());
        Character character = characterRepo.findByTag_TagId(tagId);
        character.setShortDescription(characterRequestDto.getShortDescription());
        character.setDescription(characterRequestDto.getDescription());

        tagRepo.save(tag);
        characterRepo.save(character);

        return new CharacterResponseDto(character.getCharacterId(), tag.getTagName(), character.getShortDescription(), character.getDescription());
    }

    @Transactional
    public void loadCharacterImage(Long storyId, Long tagId, MultipartFile file, String username) throws IOException {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
        if (!tag.getStory().getStoryId().equals(story.getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag");
        }
        Character character = characterRepo.findByTag_TagId(tagId);
        character.setImage(file.getBytes());
        character.setImageContentType(file.getContentType());
        characterRepo.save(character);
    }

    @Transactional
    public Pair<MediaType, byte[]> getCharacterImage(Long storyId, Long tagId, String username) {
        Story story = storyService.getStoryByIdAndUser(storyId, username);
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
        if (!tag.getStory().getStoryId().equals(story.getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag");
        }
        Character character = characterRepo.findByTag_TagId(tagId);
        if(character.getImageContentType() == null)
                throw new ResourceNotFoundException("Image not found");
        MediaType mediaType = MediaType.parseMediaType(character.getImageContentType());
        return new ImmutablePair<>(mediaType, character.getImage());
    }
}
