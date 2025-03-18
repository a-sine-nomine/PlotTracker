import React, { useState } from "react";
import apiService from "../Services/apiService";
import EditEventModal from "./EditEventModal";

const parseDate = (dateStr) => new Date(dateStr.replace(/\./g, "-")).getTime();

const Plotline = ({
  events,
  width = 800,
  height = 300,
  onEventUpdated,
  storyId,
  groupBy,
  sortBy,
}) => {
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const groupedEvents = {};
  events.forEach((event) => {
    if (!event.date) return;
    event.tags.forEach((tag) => {
      if (Number(tag.tagTypeId) === Number(groupBy)) {
        if (!groupedEvents[tag.tagId]) {
          groupedEvents[tag.tagId] = [];
        }
        groupedEvents[tag.tagId].push({
          eventId: event.eventId,
          date: parseDate(event.date),
          tagId: tag.tagId,
          tagName: tag.tagName,
          color: tag.color,
          title: event.title,
        });
      }
    });
  });

  const uniqueChars = Object.keys(groupedEvents).map((tagId) => {
    const first = groupedEvents[tagId][0];
    return {
      tagId,
      tagName: first.tagName,
      color: first.color,
      events: groupedEvents[tagId],
    };
  });
  uniqueChars.sort((a, b) => a.tagName.localeCompare(b.tagName));

  if (uniqueChars.length === 0) {
    return <div>No events to display for this group.</div>;
  }

  if (sortBy === "date") {
    const allDates = uniqueChars.flatMap((group) =>
      group.events.map((e) => e.date)
    );
    const minDate = Math.min(...allDates);
    const maxDate = Math.max(...allDates);
    const dateRange = maxDate - minDate || 86400000;

    const marginLeft = 50;
    const marginRight = 50;
    const xScale = (date) =>
      marginLeft +
      ((date - minDate) / dateRange) * (width - marginLeft - marginRight);
    const laneHeight = 30;
    const yMap = {};
    uniqueChars.forEach((char, index) => {
      yMap[char.tagId] = laneHeight * (index + 1);
    });

    const paths = uniqueChars.map((group) => {
      const evs = group.events.sort((a, b) => a.date - b.date);
      if (evs.length < 2) return null;
      let d = "";
      for (let i = 0; i < evs.length - 1; i++) {
        const e1 = evs[i];
        const e2 = evs[i + 1];
        const x1 = xScale(e1.date);
        const y1 = yMap[e1.tagId];
        const x2 = xScale(e2.date);
        const y2 = yMap[e2.tagId];
        const offset = (x2 - x1) / 3;
        if (i === 0) d += `M ${x1} ${y1} `;
        d += `C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2} `;
      }
      return (
        <path
          key={group.tagId}
          d={d}
          stroke={group.color}
          strokeWidth="3"
          fill="none"
        />
      );
    });

    const dots = uniqueChars.flatMap((group) =>
      group.events.map((e, i) => {
        const x = xScale(e.date);
        const y = yMap[e.tagId];
        const isHighlighted = hoveredEventId === e.eventId;
        return (
          <circle
            key={`${e.eventId}-${e.tagId}-${i}`}
            cx={x}
            cy={y}
            r={isHighlighted ? 13 : 8}
            fill={e.color}
            stroke={isHighlighted ? "#FFF" : "none"}
            strokeWidth={isHighlighted ? 2 : 0}
            onMouseEnter={() => setHoveredEventId(e.eventId)}
            onMouseLeave={() => setHoveredEventId(null)}
            onClick={(ev) => {
              ev.stopPropagation();
              fetchEventDetails(e.eventId);
            }}
          />
        );
      })
    );

    const fetchEventDetails = async (eventId) => {
      try {
        const response = await apiService.getPlotEvent(eventId);
        const data = await response.json();
        setEditingEvent(data);
        setShowEditModal(true);
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    const gridLines = [];
    const minYear = new Date(minDate).getFullYear();
    const maxYear = new Date(maxDate).getFullYear();
    const totalYears = maxYear - minYear + 1;
    const labelStep = totalYears > 10 ? Math.ceil(totalYears / 10) : 1;
    for (let year = minYear; year <= maxYear; year++) {
      const yearTime = new Date(year, 0, 1).getTime();
      if (yearTime < minDate || yearTime > maxDate) continue;
      const x = xScale(yearTime);
      gridLines.push(
        <line
          key={`line-${year}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height - 20}
          stroke="#ccc"
          strokeWidth="1"
        />
      );
      if ((year - minYear) % labelStep === 0) {
        gridLines.push(
          <text
            key={`label-${year}`}
            x={x}
            y={15}
            fontSize="10"
            fill="#666"
            textAnchor="middle"
          >
            {year}
          </text>
        );
      }
    }

    return (
      <>
        <svg width={width} height={height}>
          {gridLines}
          <line
            x1={marginLeft}
            y1={height - 20}
            x2={width - marginRight}
            y2={height - 20}
            stroke="#000"
            strokeWidth="1"
          />
          {paths}
          {dots}
          <text
            x={marginLeft}
            y={height - 5}
            fontSize="10"
            fill="#000"
            textAnchor="start"
          >
            {new Date(minDate).toISOString().slice(0, 10)}
          </text>
          <text
            x={width - marginRight}
            y={height - 5}
            fontSize="10"
            fill="#000"
            textAnchor="end"
          >
            {new Date(maxDate).toISOString().slice(0, 10)}
          </text>
        </svg>
        {showEditModal && editingEvent && (
          <EditEventModal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            eventData={editingEvent}
            storyId={storyId}
            onEventUpdated={(updatedEvent) => {
              if (onEventUpdated) onEventUpdated(updatedEvent);
              setShowEditModal(false);
            }}
          />
        )}
      </>
    );
  } else if (sortBy === "story") {
    const marginLeft = 50;
    const marginRight = 50;
    const spacing = 100;
    const groupedOrdered = {};
    events.forEach((event) => {
      event.tags.forEach((tag) => {
        if (Number(tag.tagTypeId) === Number(groupBy)) {
          if (!groupedOrdered[tag.tagId]) {
            groupedOrdered[tag.tagId] = [];
          }
          groupedOrdered[tag.tagId].push({
            eventId: event.eventId,
            tagId: tag.tagId,
            tagName: tag.tagName,
            color: tag.color,
            title: event.title,
          });
        }
      });
    });
    const uniqueGroups = Object.keys(groupedOrdered).map((tagId) => {
      const first = groupedOrdered[tagId][0];
      return {
        tagId,
        tagName: first.tagName,
        color: first.color,
        events: groupedOrdered[tagId],
      };
    });
    uniqueGroups.sort((a, b) => a.tagName.localeCompare(b.tagName));

    const maxCount = Math.max(
      ...uniqueGroups.map((group) => group.events.length)
    );
    const computedWidth = marginLeft + marginRight + spacing * (maxCount - 1);

    const laneHeight = 50;
    const yMap = {};
    uniqueGroups.forEach((group, index) => {
      yMap[group.tagId] = laneHeight * (index + 1);
    });

    const paths = uniqueGroups.map((group) => {
      const evs = group.events;
      if (evs.length < 2) return null;
      let d = "";
      for (let i = 0; i < evs.length - 1; i++) {
        const x1 = marginLeft + i * spacing;
        const x2 = marginLeft + (i + 1) * spacing;
        const y = yMap[group.tagId];

        const offset = (x2 - x1) / 3;
        if (i === 0) d += `M ${x1} ${y} `;
        d += `C ${x1 + offset} ${y}, ${x2 - offset} ${y}, ${x2} ${y} `;
      }
      return (
        <path
          key={group.tagId}
          d={d}
          stroke={group.color}
          strokeWidth="3"
          fill="none"
        />
      );
    });

    const dots = uniqueGroups.flatMap((group) =>
      group.events.map((e, i) => {
        const x = marginLeft + i * spacing;
        const y = yMap[group.tagId];
        const isHighlighted = hoveredEventId === e.eventId;
        return (
          <g key={`${e.eventId}-${e.tagId}-${i}`}>
            <circle
              cx={x}
              cy={y}
              r={isHighlighted ? 13 : 8}
              fill={e.color}
              stroke={isHighlighted ? "#FFF" : "none"}
              strokeWidth={isHighlighted ? 2 : 0}
              onMouseEnter={() => setHoveredEventId(e.eventId)}
              onMouseLeave={() => setHoveredEventId(null)}
              onClick={(ev) => {
                ev.stopPropagation();
                fetchEventDetails(e.eventId);
              }}
            />
            <text x={x + 10} y={y + 5} fontSize="10" fill="#000">
              {e.title}
            </text>
          </g>
        );
      })
    );

    const fetchEventDetails = async (eventId) => {
      try {
        const response = await apiService.getPlotEvent(eventId);
        const data = await response.json();
        setEditingEvent(data);
        setShowEditModal(true);
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    return (
      <>
        <svg width={computedWidth} height={height}>
          <line
            x1={marginLeft}
            y1={height / 2}
            x2={computedWidth - marginRight}
            y2={height / 2}
            stroke="#000"
            strokeWidth="1"
          />
          {paths}
          {dots}
        </svg>
        {showEditModal && editingEvent && (
          <EditEventModal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            eventData={editingEvent}
            storyId={storyId}
            onEventUpdated={(updatedEvent) => {
              if (onEventUpdated) onEventUpdated(updatedEvent);
              setShowEditModal(false);
            }}
          />
        )}
      </>
    );
  }
};

export default Plotline;
