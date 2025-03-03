import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import apiService from "../Services/apiService";
import Toolbar from "../Toolbar";
import { useTranslation } from "react-i18next";
import "./StoryPage.css";

const StoryPage = () => {
  const { storyId } = useParams();
  const { t } = useTranslation();

  const [plotEvents, setPlotEvents] = useState([]);
  const [storyDetails, setStoryDetails] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagTypes, setTagTypes] = useState([]);

  const [tagsSectionOpen, setTagsSectionOpen] = useState(false);
  const [openTagTypes, setOpenTagTypes] = useState({});

  //Fetch plot events
  useEffect(() => {
    const fetchPlotEvents = async () => {
      try {
        const response = await apiService.getPlotEvents(storyId);
        const data = await response.json();
        setPlotEvents(data);
      } catch (error) {
        console.error("Error fetching plot events:", error);
      }
    };
    fetchPlotEvents();
  }, [storyId]);

  //Fetch story details
  useEffect(() => {
    const fetchStoryDetails = async () => {
      try {
        const response = await apiService.getStoryDetails(storyId);
        const data = await response.json();
        setStoryDetails(data);
      } catch (error) {
        console.error("Error fetching story details:", error);
      }
    };
    fetchStoryDetails();
  }, [storyId]);

  //Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await apiService.getTags(storyId);
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
  }, [storyId]);

  //Fetch tag types
  useEffect(() => {
    const fetchTagTypes = async () => {
      try {
        const response = await apiService.getTagTypes(storyId);
        const data = await response.json();
        setTagTypes(data);
      } catch (error) {
        console.error("Error fetching tag types:", error);
      }
    };
    fetchTagTypes();
  }, [storyId]);

  //Sort tag types alphabetically by name
  const sortedTagTypes = [...tagTypes].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  //Group tags by tagTypeId and sort each group alphabetically by tagName
  const groupedTags = {};
  tags.forEach((tag) => {
    if (!groupedTags[tag.tagTypeId]) {
      groupedTags[tag.tagTypeId] = [];
    }
    groupedTags[tag.tagTypeId].push(tag);
  });
  Object.keys(groupedTags).forEach((key) => {
    groupedTags[key].sort((a, b) => a.tagName.localeCompare(b.tagName));
  });

  const toggleTagType = (tagTypeId) => {
    setOpenTagTypes((prev) => ({
      ...prev,
      [tagTypeId]: !prev[tagTypeId],
    }));
  };

  //Inline component for editing a tag
  const TagRow = ({ tag }) => {
    const [editing, setEditing] = useState(false);
    const [newTagName, setNewTagName] = useState(tag.tagName);

    const handleRenameSubmit = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const response = await apiService.updateTag(storyId, tag.tagId, {
          tagName: newTagName,
          tagTypeId: tag.tagTypeId,
        });
        const updatedTag = await response.json();
        setTags((prev) =>
          prev.map((t) => (t.tagId === tag.tagId ? updatedTag : t))
        );
      } catch (error) {
        console.error("Error updating tag:", error);
      }
      setEditing(false);
    };

    const handleDelete = async (e) => {
      e.stopPropagation();
      try {
        await apiService.deleteTag(storyId, tag.tagId);
        setTags((prev) => prev.filter((t) => t.tagId !== tag.tagId));
      } catch (error) {
        console.error("Error deleting tag:", error);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleRenameSubmit(e);
      }
    };

    return (
      <div className="item-row" onClick={(e) => e.stopPropagation()}>
        {editing ? (
          <form onSubmit={handleRenameSubmit} className="item-rename-form">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button type="submit">Save</button>
          </form>
        ) : (
          <span className="item-text">{tag.tagName}</span>
        )}
        {!editing && (
          <>
            <span
              className="icon item-edit-icon"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
            >
              ✎
            </span>
            <span className="icon item-delete-icon" onClick={handleDelete}>
              🗑
            </span>
          </>
        )}
      </div>
    );
  };

  //Inline component for editing a tag type
  const TagTypeRow = ({ tagType, onToggle }) => {
    const [editing, setEditing] = useState(false);
    const [newName, setNewName] = useState(tagType.name);

    const handleRenameSubmit = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const response = await apiService.updateTagType(
          storyId,
          tagType.tagTypeId,
          { name: newName }
        );
        const updatedTagType = await response.json();
        setTagTypes((prev) =>
          prev.map((tt) =>
            tt.tagTypeId === tagType.tagTypeId ? updatedTagType : tt
          )
        );
      } catch (error) {
        console.error("Error updating tag type:", error);
      }
      setEditing(false);
    };

    const handleDelete = async (e) => {
      e.stopPropagation();
      try {
        await apiService.deleteTagType(storyId, tagType.tagTypeId);
        setTagTypes((prev) =>
          prev.filter((tt) => tt.tagTypeId !== tagType.tagTypeId)
        );
      } catch (error) {
        console.error("Error deleting tag type:", error);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleRenameSubmit(e);
      }
    };

    return (
      <div className="item-row" onClick={onToggle}>
        {editing ? (
          <form onSubmit={handleRenameSubmit} className="item-rename-form">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button type="submit">Save</button>
          </form>
        ) : (
          <span className="item-text">{tagType.name}</span>
        )}
        {!editing && (
          <>
            <span
              className="icon item-edit-icon"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
            >
              ✎
            </span>
            <span className="icon item-delete-icon" onClick={handleDelete}>
              🗑
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="storypage-wrapper">
      <Toolbar />
      <div className="storypage-container">
        <div className="left-panel">
          <h4 className="panel-header">
            {storyDetails ? storyDetails.title : `Story ${storyId}`}
          </h4>
          <div className="collapsible-section">
            <div
              className="section-header tags-section-header"
              onClick={() => setTagsSectionOpen((prev) => !prev)}
            >
              <span>{tagsSectionOpen ? "➴" : "➵"}</span> {t("storyPage.tags")}
            </div>
            {tagsSectionOpen && (
              <div className="tags-group">
                {sortedTagTypes.map((tt) => (
                  <div key={tt.tagTypeId} className="tag-type-group">
                    <TagTypeRow
                      tagType={tt}
                      onToggle={() => toggleTagType(tt.tagTypeId)}
                    />
                    {openTagTypes[tt.tagTypeId] && (
                      <div className="tags-list">
                        {(groupedTags[tt.tagTypeId] || []).map((tag) => (
                          <TagRow key={tag.tagId} tag={tag} />
                        ))}
                      </div>
                    )}
                    <hr className="section-divider" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="center-panel">
          {plotEvents.length > 0 ? (
            plotEvents.map((event) => (
              <div key={event.eventId} className="plot-event">
                <h5>{event.title}</h5>
                {event.description && <p>{event.description}</p>}
              </div>
            ))
          ) : (
            <p>{t("storyPage.noEvents")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryPage;
