package com.sinenomine.plottracker.service;

import com.sinenomine.plottracker.dto.StoryRequestDto;
import com.sinenomine.plottracker.dto.StoryResponseDto;
import com.sinenomine.plottracker.exception.DocumentGenerationException;
import com.sinenomine.plottracker.exception.ResourceNotFoundException;
import com.sinenomine.plottracker.exception.UnauthorizedException;
import com.sinenomine.plottracker.model.*;
import com.sinenomine.plottracker.model.Character;
import com.sinenomine.plottracker.repo.*;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

@Service
public class StoryService {
    private static final Long DEMO_TEMPLATE_ID = 1L;

    private final Logger log = LoggerFactory.getLogger(StoryService.class);
    private final StoryRepo storyRepo;
    private final UserRepo userRepo;
    private final PlotEventRepo plotEventRepo;
    private final TagRepo tagRepo;
    private final CharacterRepo characterRepo;
    private final TagTypeRepo tagTypeRepo;
    private final PlotEventService plotEventService;

    public StoryService(StoryRepo storyRepo, UserRepo userRepo, PlotEventRepo plotEventRepo, TagRepo tagRepo, CharacterRepo characterRepo, TagTypeRepo tagTypeRepo, PlotEventService plotEventService) {
        this.storyRepo = storyRepo;
        this.userRepo = userRepo;
        this.plotEventRepo = plotEventRepo;
        this.tagRepo = tagRepo;
        this.characterRepo = characterRepo;
        this.tagTypeRepo = tagTypeRepo;
        this.plotEventService = plotEventService;
    }

    // Get all stories for a user
    public List<StoryResponseDto> findByUser(String username) {
        return storyRepo.findByUserResponses(username);
    }

    // Create a new story for the current user
    public Story createStory(String username, StoryRequestDto storyRequestDto) {
        Users user = userRepo.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        Story story = new Story();
        story.setTitle(storyRequestDto.getTitle());
        story.setDescription(storyRequestDto.getDescription());
        story.setDateFormat(storyRequestDto.getDateFormat());
        story.setUser(user);
        return storyRepo.save(story);
    }

    // Get details for a specific story (only if it belongs to the user)
    public Story getStoryDetails(String username, Long storyId) {
        return getStoryByIdAndUser(storyId, username);
    }

    // Update an existing story
    public Story updateStory(String username, Long storyId, StoryRequestDto storyRequestDto) {
        Story existingStory = getStoryByIdAndUser(storyId, username);
        existingStory.setTitle(storyRequestDto.getTitle());
        existingStory.setDescription(storyRequestDto.getDescription());
        return storyRepo.save(existingStory);
    }

    // Delete a story
    @Transactional
    public void deleteStory(String username, Long storyId) {
        Story story = getStoryByIdAndUser(storyId, username);
        plotEventRepo.deletePlotEventTagByStoryId(storyId);
        characterRepo.deleteByStoryId(storyId);
        tagRepo.deleteByStory_StoryId(storyId);
        tagTypeRepo.deleteByStory_StoryId(storyId);
        plotEventRepo.deleteByStory_StoryId(storyId);
        storyRepo.delete(story);
    }

    // Get all plot events for a given story
    public Set<PlotEvent> getPlotEvents(String username, Long storyId) {
        Story story = storyRepo.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        if (!story.getUser().getUsername().equals(username)) {
            throw new UnauthorizedException("Unauthorized access to story");
        }
        return plotEventRepo.findByStory(storyId);
    }

    // Add a new plot event to a given story; if provided, resolve memoryRef and nextEvent
    public PlotEvent addPlotEventToStory(String username, Long storyId, PlotEvent plotEvent, Long memoryRefId, Long prevEventId, Set<Long> tags) {
        PlotEvent savedPlotEvent = new PlotEvent();
        PlotEvent prevEvent = new PlotEvent();
        PlotEvent nextEvent = new PlotEvent();

        Story story = getStoryByIdAndUser(storyId, username);
        plotEvent.setStory(story);
        if (memoryRefId != null) {
            PlotEvent memoryRef = plotEventRepo.findById(memoryRefId)
                    .orElseThrow(() -> new ResourceNotFoundException("Memory reference plot event not found"));
            plotEvent.setMemoryRef(memoryRef);
        }

        Set<PlotEvent> eventSet = getPlotEvents(username, storyId);
        List<PlotEvent> events = new java.util.ArrayList<>(eventSet);
        Optional<PlotEvent> firstEvent = events.stream()
                .filter(e -> (e.getPrevEvent() == null && e.getInPlot()))
                .findFirst();

        if (plotEvent.getInPlot()) {
            if (prevEventId == null && firstEvent.isEmpty()) {
                savedPlotEvent = plotEventRepo.save(plotEvent);
            } else if (prevEventId == null) {
                plotEvent.setNextEvent(firstEvent.get());
                savedPlotEvent = plotEventRepo.save(plotEvent);
                firstEvent.get().setPrevEvent(savedPlotEvent);
                plotEventRepo.save(firstEvent.get());
            } else {
                prevEvent = plotEventRepo.findById(prevEventId)
                        .orElseThrow(() -> new ResourceNotFoundException("Next event not found"));
                plotEvent.setPrevEvent(prevEvent);

                if (prevEvent.getNextEvent() == null) {
                    savedPlotEvent = plotEventRepo.save(plotEvent);
                    prevEvent.setNextEvent(savedPlotEvent);
                    plotEventRepo.save(prevEvent);
                } else {
                    nextEvent = prevEvent.getNextEvent();
                    nextEvent.setPrevEvent(null);
                    PlotEvent updatedNextEvent = plotEventRepo.save(nextEvent);

                    savedPlotEvent = plotEventRepo.save(plotEvent);
                    prevEvent.setNextEvent(savedPlotEvent);
                    plotEventRepo.save(prevEvent);

                    updatedNextEvent.setPrevEvent(savedPlotEvent);
                    updatedNextEvent = plotEventRepo.save(updatedNextEvent);

                    plotEvent.setNextEvent(updatedNextEvent);
                    savedPlotEvent = plotEventRepo.save(plotEvent);
                }
            }
        }

        for (Long tagId : tags) {
            plotEventService.addTagToPlotEvent(savedPlotEvent.getEventId(), tagId, username);
        }
        return plotEventService.getPlotEventById(username, savedPlotEvent.getEventId());
    }

    // Helper method to ensure the story exists and belongs to the current user
    Story getStoryByIdAndUser(Long storyId, String username) {
        Story story = storyRepo.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        if (!story.getUser().getUsername().equals(username)) {
            throw new UnauthorizedException("Unauthorized access to story");
        }
        return story;
    }

    // Export plot events as a DOCX file for the specified story
    public byte[] exportPlotEventsAsDocx(String username, Long storyId, String as) {
        Story story = storyRepo.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        if (!story.getUser().getUsername().equals(username)) {
            throw new UnauthorizedException("Unauthorized access to story");
        }
        List<Character> characters = new ArrayList<>();

        if (as.equals("script")) {
            characters = characterRepo.findByTag_Story_StoryId(storyId);
        }

        Set<PlotEvent> eventSet = getPlotEvents(username, storyId);
        List<PlotEvent> events = new ArrayList<>(eventSet);
        PlotEvent firstEvent = events.stream()
                .filter(e -> e.getPrevEvent() == null && e.getInPlot())
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No starting event found"));
        List<PlotEvent> orderedEvents = new java.util.ArrayList<>();
        PlotEvent current = firstEvent;
        while (current != null) {
            orderedEvents.add(current);
            current = current.getNextEvent();
        }
        StringBuilder sb = new StringBuilder();

        sb.append(story.getTitle()).append("\n\n");
        sb.append(story.getDescription()).append("\n\n");

        for (Character ch : characters) {
            sb.append(ch.getTag().getTagName());
            if (ch.getShortDescription() != null) {
                sb.append(", ").append(ch.getShortDescription());
            }
            sb.append("\n\n");
        }

        for (PlotEvent pe : orderedEvents) {
            if (pe.getContent() != null) {
                sb.append(pe.getContent()).append("\n\n");
            }
        }
        String finalContent = sb.toString();

        try (XWPFDocument doc = new XWPFDocument();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            String[] paras = finalContent.split("\\r?\\n\\r?\\n");
            for (String para : paras) {
                XWPFParagraph p = doc.createParagraph();
                XWPFRun r = p.createRun();
                r.setText(para);
            }
            doc.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new DocumentGenerationException("Error generating document: " + e.getMessage());
        }
    }

    @Transactional
    public void cloneDemoStoryForUser(Users newUser) {
        Story template = storyRepo.findById(DEMO_TEMPLATE_ID)
                .orElseThrow(() -> new IllegalStateException("Demo template missing"));

        Story clone = new Story();
        clone.setTitle(template.getTitle());
        clone.setDescription(template.getDescription());
        clone.setDateFormat(template.getDateFormat());
        clone.setUser(newUser);
        storyRepo.save(clone);

        Map<Long, TagType> typeMap = new HashMap<>();
        tagTypeRepo.findByStory_StoryId(DEMO_TEMPLATE_ID)
                .forEach(oldType -> {
                    TagType t = new TagType();
                    t.setName(oldType.getName());
                    t.setStory(clone);
                    tagTypeRepo.save(t);
                    typeMap.put(oldType.getTagTypeId(), t);
                });

        // 4) clone Tags
        Map<Long, Tag> tagMap = new HashMap<>();
        tagRepo.findByStory_StoryId(DEMO_TEMPLATE_ID)
                .forEach(oldTag -> {
                    Tag t = new Tag();
                    t.setTagName(oldTag.getTagName());
                    t.setColor(oldTag.getColor());
                    t.setTagType(typeMap.get(oldTag.getTagType().getTagTypeId()));
                    t.setStory(clone);
                    tagRepo.save(t);
                    tagMap.put(oldTag.getTagId(), t);
                });

        characterRepo.findByTag_Story_StoryId(DEMO_TEMPLATE_ID)
                .forEach(oldChar -> {
                    Character c = new Character();
                    c.setShortDescription(oldChar.getShortDescription());
                    c.setDescription(oldChar.getDescription());
                    c.setTag(tagMap.get(oldChar.getTag().getTagId()));
                    c.setImage(oldChar.getImage());
                    c.setImageContentType(oldChar.getImageContentType());
                    characterRepo.save(c);
                });

        Map<Long, PlotEvent> eventMap = new HashMap<>();
        plotEventRepo.findByStory_StoryId(DEMO_TEMPLATE_ID)
                .forEach(oldE -> {
                    PlotEvent e = new PlotEvent();
                    e.setTitle(oldE.getTitle());
                    e.setDate(oldE.getDate());
                    e.setEventType(oldE.getEventType());
                    e.setDescription(oldE.getDescription());
                    e.setContent(oldE.getContent());
                    e.setInPlot(oldE.getInPlot());
                    e.setStory(clone);
                    plotEventRepo.save(e);
                    eventMap.put(oldE.getEventId(), e);
                });

        plotEventRepo.findByStory_StoryId(DEMO_TEMPLATE_ID)
                .forEach(oldE -> {
                    PlotEvent e = eventMap.get(oldE.getEventId());
                    if (oldE.getPrevEvent() != null)
                        e.setPrevEvent(eventMap.get(oldE.getPrevEvent().getEventId()));
                    if (oldE.getNextEvent() != null)
                        e.setNextEvent(eventMap.get(oldE.getNextEvent().getEventId()));
                    oldE.getTags().forEach(oldTag ->
                            e.getTags().add(tagMap.get(oldTag.getTagId()))
                    );
                    plotEventRepo.save(e);
                });
    }
}