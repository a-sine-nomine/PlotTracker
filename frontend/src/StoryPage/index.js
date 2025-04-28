import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Form } from "react-bootstrap";
import apiService from "../Services/apiService";
import Toolbar from "../Toolbar";
import Plotline from "./Plotline";
import VisualizationSettings from "./VisualizationSettings";
import EditEventModal from "./EditEventModal";
import { useTranslation } from "react-i18next";
import TagTypeRow from "./TagTypeRow";
import "./StoryPage.css";

const StoryPage = () => {
  const { storyId } = useParams();
  const { t } = useTranslation();

  const [plotEvents, setPlotEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [storyDetails, setStoryDetails] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagTypes, setTagTypes] = useState([]);
  const [tagsSectionOpen, setTagsSectionOpen] = useState(false);
  const [openTagTypes, setOpenTagTypes] = useState({});
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [groupBy, setGroupBy] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const [eventsSectionOpen, setEventsSectionOpen] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [eventTagsFilter, setEventTagsFilter] = useState("all");

  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [currentEditEvent, setCurrentEditEvent] = useState(null);

  const parseDateStr = (str) => new Date(str.replace(/\./g, "-")).getTime();

  useEffect(() => {
    const fetchPlotEvents = async () => {
      try {
        const response = await apiService.getPlotEvents(storyId, sortBy);
        const data = await response.json();
        setPlotEvents(data);
        setFilteredEvents(data);
      } catch (error) {
        console.error("Error fetching plot events:", error);
      }
    };
    fetchPlotEvents();
  }, [storyId, sortBy]);

  useEffect(() => {
    let evs = [...plotEvents];
    if (eventTypeFilter !== "all") {
      evs = evs.filter((e) => e.eventType === eventTypeFilter);
    }
    if (eventTagsFilter === "have") {
      evs = evs.filter((e) => (e.tags || []).length > 0);
    } else if (eventTagsFilter === "none") {
      evs = evs.filter((e) => !(e.tags || []).length);
    }
    setDisplayedEvents(evs);
  }, [plotEvents, eventTypeFilter, eventTagsFilter]);

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
        if (data.length > 0 && !groupBy) {
          setGroupBy(data[0].tagTypeId);
        }
      } catch (error) {
        console.error("Error fetching tag types:", error);
      }
    };
    fetchTagTypes();
  }, [storyId, groupBy]);

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

  const handleFilterChange = ({
    filterMode,
    checkedIds,
    groupBy: newGroupBy,
    sortBy: newSortBy,
    startDate,
    endDate,
  }) => {
    setGroupBy(newGroupBy);
    setSortBy(newSortBy);
    const filtered = plotEvents.filter((event) => {
      const eventTagIds = event.tags.map((t) => t.tagId);
      const eventGroupTags = event.tags.filter(
        (t) => t.tagTypeId === Number(newGroupBy)
      );
      if (filterMode === "or") {
        return eventGroupTags.some((t) => checkedIds.includes(t.tagId));
      } else {
        return checkedIds.every((id) =>
          eventGroupTags.map((t) => t.tagId).includes(id)
        );
      }
    });

    const datedEvents = plotEvents.filter((e) => e.date);
    const allTimestamps = datedEvents.map((e) => parseDateStr(e.date));
    const globalMin = Math.min(...allTimestamps);
    const globalMax = Math.max(...allTimestamps);

    const lower = startDate ? parseDateStr(startDate) : globalMin;
    const upper = endDate ? parseDateStr(endDate) : globalMax;

    var newFilterd = filtered.filter((e) => {
      if (!e.date) return false;
      const ts = parseDateStr(e.date);
      return ts >= lower && ts <= upper;
    });

    setFilteredEvents(newFilterd);
  };

  const openEdit = (evt) => {
    setCurrentEditEvent(evt);
    setShowEditEventModal(true);
  };

  return (
    <div className="storypage-wrapper">
      <Toolbar
        onNewTagTypeCreated={(newTagType) =>
          setTagTypes((prev) => [...prev, newTagType])
        }
        onNewTagCreated={(newTag) => setTags((prev) => [...prev, newTag])}
        onNewEventCreated={(newEvent) => {
          setPlotEvents((prev) => [...prev, newEvent]);
          setFilteredEvents((prev) => [...prev, newEvent]);
        }}
      />
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
                {tagTypes
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((tt) => (
                    <TagTypeRow
                      key={tt.tagTypeId}
                      tagType={tt}
                      tags={
                        tags.filter((t) => t.tagTypeId === tt.tagTypeId) || []
                      }
                      isOpen={!!openTagTypes[tt.tagTypeId]}
                      onToggle={() => toggleTagType(tt.tagTypeId)}
                      storyId={storyId}
                      onTagCreated={(newTag) =>
                        setTags((prev) => [...prev, newTag])
                      }
                      onTagUpdated={updateTag}
                      onTagDeleted={deleteTag}
                      onTagTypeUpdated={updateTagType}
                      onTagTypeDeleted={deleteTagType}
                    />
                  ))}
              </div>
            )}
          </div>

          {}
          <div className="collapsible-section mt-4">
            <div
              className="section-header tags-section-header"
              onClick={() => setEventsSectionOpen((prev) => !prev)}
            >
              <span>{eventsSectionOpen ? "➴" : "➵"}</span>{" "}
              {t("storyPage.events", "Events")}
            </div>
            {eventsSectionOpen && (
              <>
                <div className="mb-2">
                  <Form.Select
                    className="mb-1"
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value)}
                  >
                    <option value="all">
                      {t("storyPage.allTypes", "All types")}
                    </option>
                    <option value="dated">
                      {t("eventTypes.dated", "Dated")}
                    </option>
                    <option value="memory">
                      {t("eventTypes.memory", "Memory")}
                    </option>
                    <option value="undated">
                      {t("eventTypes.undated", "Undated")}
                    </option>
                  </Form.Select>
                  <Form.Select
                    value={eventTagsFilter}
                    onChange={(e) => setEventTagsFilter(e.target.value)}
                  >
                    <option value="all">
                      {t("storyPage.allTags", "All options")}
                    </option>
                    <option value="have">
                      {t("storyPage.haveTags", "Have tags")}
                    </option>
                    <option value="none">
                      {t("storyPage.withoutTags", "No tags")}
                    </option>
                  </Form.Select>
                </div>
                <div className="events-list">
                  {displayedEvents
                    .slice()
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((ev) => (
                      <div
                        key={ev.eventId}
                        className="item-row"
                        onClick={() => openEdit(ev)}
                      >
                        {ev.title}
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="center-panel">
          <div className="visualization-settings-container">
            <VisualizationSettings
              availableTags={tags}
              tagTypes={tagTypes}
              onFilterChange={handleFilterChange}
              onGroupByChange={(groupBy) => setGroupBy(groupBy)}
              onSortByChange={(sort) => setSortBy(sort)}
            />
          </div>
          <div className="plotline-container">
            <Plotline
              events={filteredEvents}
              width={1200}
              height={800}
              storyId={storyId}
              onEventUpdated={(updatedEvent) => {
                setPlotEvents((prev) =>
                  prev.map((e) =>
                    e.eventId === updatedEvent.eventId ? updatedEvent : e
                  )
                );
                setFilteredEvents((prev) =>
                  prev.map((e) =>
                    e.eventId === updatedEvent.eventId ? updatedEvent : e
                  )
                );
              }}
              groupBy={groupBy}
              sortBy={sortBy}
            />
          </div>
        </div>
      </div>

      {currentEditEvent && (
        <EditEventModal
          show={showEditEventModal}
          onHide={() => setShowEditEventModal(false)}
          eventData={currentEditEvent}
          storyId={storyId}
          onEventUpdated={(evt) => {
            setPlotEvents((prev) =>
              prev.map((e) => (e.eventId === evt.eventId ? evt : e))
            );
            setDisplayedEvents((prev) =>
              prev.map((e) => (e.eventId === evt.eventId ? evt : e))
            );
            setShowEditEventModal(false);
          }}
        />
      )}
    </div>
  );
};

export default StoryPage;
