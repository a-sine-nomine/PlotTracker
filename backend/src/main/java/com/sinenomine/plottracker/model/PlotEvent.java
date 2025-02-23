package com.sinenomine.plottracker.model;

import com.sinenomine.plottracker.enums.EventType;
import jakarta.persistence.*;

import java.util.Set;
import java.util.HashSet;

@Entity
public class PlotEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;

    @ManyToOne
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 50)
    private String date;

    @Column
    private String description;

    @Lob
    @Column
    private String content;

    // Self-reference for memory_ref_id
    @ManyToOne
    @JoinColumn(name = "memory_ref_id", foreignKey = @ForeignKey(name = "FK_memory_ref"))
    private PlotEvent memoryRef;

    // Self-reference for next_event_id
    @OneToOne
    @JoinColumn(name = "next_event_id", foreignKey = @ForeignKey(name = "FK_next_event"))
    private PlotEvent nextEvent;

    // Relationship to Tag via a join table PlotEventTag
    @ManyToMany
    @JoinTable(
            name = "PlotEventTag",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    public PlotEvent() {
    }

    public PlotEvent(Story story, EventType eventType, String title) {
        this.story = story;
        this.eventType = eventType;
        this.title = title;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Story getStory() {
        return story;
    }

    public void setStory(Story story) {
        this.story = story;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public PlotEvent getMemoryRef() {
        return memoryRef;
    }

    public void setMemoryRef(PlotEvent memoryRef) {
        this.memoryRef = memoryRef;
    }

    public PlotEvent getNextEvent() {
        return nextEvent;
    }

    public void setNextEvent(PlotEvent nextEvent) {
        this.nextEvent = nextEvent;
    }

    public java.util.Set<Tag> getTags() {
        return tags;
    }

    public void setTags(java.util.Set<Tag> tags) {
        this.tags = tags;
    }
}
