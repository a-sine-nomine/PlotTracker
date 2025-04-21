package com.sinenomine.plottracker.repo;

import com.sinenomine.plottracker.model.Character;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CharacterRepo extends JpaRepository<Character, Long> {

    Character findByCharacterId(Long characterId);

    Character findByTag_TagId(Long tagId);

    long deleteByTag_TagId(Long tagId);
}