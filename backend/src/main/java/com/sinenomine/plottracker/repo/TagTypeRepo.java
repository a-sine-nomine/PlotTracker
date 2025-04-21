package com.sinenomine.plottracker.repo;

import com.sinenomine.plottracker.dto.TagTypeResponseDto;
import com.sinenomine.plottracker.model.TagType;
import com.sinenomine.plottracker.model.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface TagTypeRepo extends JpaRepository<TagType, Long> {
    Set<TagType> findByStory(Story story);

    @Query("SELECT new com.sinenomine.plottracker.dto.TagTypeResponseDto(t.tagTypeId, t.name) " +
            "FROM TagType t WHERE t.story = :story")
    List<TagTypeResponseDto> findByStoryResponses(Story story);

    long deleteByStory_StoryId(Long storyId);
}
