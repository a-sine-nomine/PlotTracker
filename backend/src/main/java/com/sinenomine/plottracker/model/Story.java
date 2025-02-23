package com.sinenomine.plottracker.model;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
public class Story {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "story_id")
    private Long storyId;

    @Column(nullable = false)
    private String title;

    private String description;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

//    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<PlotEvent> plotEvents = new ArrayList<>();

    public Story() {
    }

    public Story(Users user, String title) {
        this.user = user;
        this.title = title;
    }

    public Long getStoryId() {
        return storyId;
    }

    public void setStoryId(Long storyId) {
        this.storyId = storyId;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

//    public List<PlotEvent> getPlotEvents() {
//        return plotEvents;
//    }
//
//    public void setPlotEvents(List<PlotEvent> plotEvents) {
//        this.plotEvents = plotEvents;
//    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Story that = (Story) o;
        return storyId.equals(that.storyId) && user.equals(that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(storyId, user);
    }
}
