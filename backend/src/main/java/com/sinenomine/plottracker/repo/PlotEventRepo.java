package com.sinenomine.plottracker.repo;

import com.sinenomine.plottracker.model.PlotEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface PlotEventRepo extends JpaRepository<PlotEvent, Long> {

    @Query("select p from PlotEvent p where p.story.storyId = :storyId")
    Set<PlotEvent> findByStory(Long storyId);

    long deleteByStory_StoryId(Long storyId);

    @Modifying
    @Query(
            value  = "DELETE p FROM plot_event_tag p JOIN Tag t ON p.tag_id = t.tag_id WHERE t.story_id = :storyId",
            nativeQuery = true
    )
    int deletePlotEventTagByStoryId(@Param("storyId") Long storyId);

    @Modifying
    @Query(
            value  = "DELETE p FROM plot_event_tag p WHERE p.tag_id = :tagId",
            nativeQuery = true
    )
    int deletePlotEventTagByTagId(@Param("tagId") Long tagId);
}