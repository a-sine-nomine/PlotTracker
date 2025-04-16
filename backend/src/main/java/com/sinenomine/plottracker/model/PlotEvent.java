package com.sinenomine.plottracker.model;

import com.sinenomine.plottracker.enums.EventType;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

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

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name = "memory_ref_id", foreignKey = @ForeignKey(name = "FK_memory_ref"))
    private PlotEvent memoryRef;

    @OneToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name = "prev_event_id", foreignKey = @ForeignKey(name = "FK_prev_event"))
    private PlotEvent prevEvent;

    @OneToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name = "next_event_id", foreignKey = @ForeignKey(name = "FK_next_event"))
    private PlotEvent nextEvent;

    @ManyToMany(cascade = CascadeType.REMOVE)
    @JoinTable(
            name = "PlotEventTag",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

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

    public PlotEvent getPrevEvent() {
        return prevEvent;
    }

    public void setPrevEvent(PlotEvent prevEvent) {
        this.prevEvent = prevEvent;
    }

    public PlotEvent getNextEvent() {
        return nextEvent;
    }

    public void setNextEvent(PlotEvent nextEvent) {
        this.nextEvent = nextEvent;
    }

    public Set<Tag> getTags() {
        return tags;
    }

    public void setTags(Set<Tag> tags) {
        this.tags = tags;
    }
}
