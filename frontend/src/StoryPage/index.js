import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiService from "../Services/apiService";
import Toolbar from "../Toolbar";
import Plotline from "./Plotline";
import VisualizationSettings from "./VisualizationSettings";
import { useTranslation } from "react-i18next";
import TagTypeRow from "./TagTypeRow";
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
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const fetchPlotEvents = async () => {
      try {
        const response = await apiService.getPlotEvents(storyId, "date");
        const data = await response.json();
        setPlotEvents(data);
        setFilteredEvents(data);
      } catch (error) {
        console.error("Error fetching plot events:", error);
      }
    };
    fetchPlotEvents();
  }, [storyId]);

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

  const sortedTagTypes = [...tagTypes].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const groupedTags = {};
  tags.forEach((tag) => {
    if (!groupedTags[tag.tagTypeId]) groupedTags[tag.tagTypeId] = [];
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

  const updateTag = (updatedTag) => {
    setTags((prev) =>
      prev.map((t) => (t.tagId === updatedTag.tagId ? updatedTag : t))
    );
  };

  const deleteTag = (deletedTagId) => {
    setTags((prev) => prev.filter((t) => t.tagId !== deletedTagId));
  };

  const updateTagType = (updatedTagType) => {
    setTagTypes((prev) =>
      prev.map((tt) =>
        tt.tagTypeId === updatedTagType.tagTypeId ? updatedTagType : tt
      )
    );
  };

  const deleteTagType = (deletedTagTypeId) => {
    setTagTypes((prev) =>
      prev.filter((tt) => tt.tagTypeId !== deletedTagTypeId)
    );
  };

  const handleFilterChange = ({ filterMode, checkedIds }) => {
    const filtered = plotEvents.filter((event) => {
      const eventTagIds = event.tags.map((t) => t.tagId);
      if (filterMode === "or") {
        return checkedIds.some((id) => eventTagIds.includes(id));
      } else {
        return checkedIds.every((id) => eventTagIds.includes(id));
      }
    });
    setFilteredEvents(filtered);
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
                  <TagTypeRow
                    key={tt.tagTypeId}
                    tagType={tt}
                    tags={groupedTags[tt.tagTypeId] || []}
                    isOpen={!!openTagTypes[tt.tagTypeId]}
                    onToggle={() => toggleTagType(tt.tagTypeId)}
                    storyId={storyId}
                    onTagUpdated={updateTag}
                    onTagDeleted={deleteTag}
                    onTagTypeUpdated={updateTagType}
                    onTagTypeDeleted={deleteTagType}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="center-panel">
          <div className="visualization-settings-container">
            <VisualizationSettings
              availableTags={tags}
              onFilterChange={handleFilterChange}
            />
          </div>
          <div className="plotline-container">
            <Plotline
              events={filteredEvents}
              width={1200}
              height={800}
              storyId={storyId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPage;
