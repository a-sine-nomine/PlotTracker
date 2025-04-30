package com.sinenomine.plottracker.repo;

import com.sinenomine.plottracker.model.Character;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CharacterRepo extends JpaRepository<Character, Long> {

    Character findByCharacterId(Long characterId);

    Character findByTag_TagId(Long tagId);

    List<Character> findByTag_Story_StoryId(Long StoryId);

    long deleteByTag_TagId(Long tagId);

    @Modifying
    @Query(
            value  = "DELETE c FROM characters c JOIN Tag t ON c.tag_id = t.tag_id WHERE t.story_id = :storyId",
            nativeQuery = true
    )
    int deleteByStoryId(@Param("storyId") Long storyId);
}