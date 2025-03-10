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
}) => {
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const characterEvents = [];
  events.forEach((event) => {
    if (!event.date) return;
    const timestamp = parseDate(event.date);
    event.tags.forEach((tag) => {
      if (tag.tagTypeName === "Персонаж") {
        characterEvents.push({
          eventId: event.eventId,
          date: timestamp,
          tagId: tag.tagId,
          tagName: tag.tagName,
          color: tag.color,
        });
      }
    });
  });

  if (characterEvents.length === 0) {
    return <div>No character events to display.</div>;
  }

  const dates = characterEvents.map((e) => e.date);
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const dateRange = maxDate - minDate || 86400000;

  const marginLeft = 50;
  const marginRight = 50;
  const xScale = (date) =>
    marginLeft +
    ((date - minDate) / dateRange) * (width - marginLeft - marginRight);

  const eventsByChar = {};
  characterEvents.forEach((e) => {
    if (!eventsByChar[e.tagId]) eventsByChar[e.tagId] = [];
    eventsByChar[e.tagId].push(e);
  });
  Object.keys(eventsByChar).forEach((tagId) =>
    eventsByChar[tagId].sort((a, b) => a.date - b.date)
  );

  const uniqueChars = Object.keys(eventsByChar).map((tagId) => {
    const first = eventsByChar[tagId][0];
    return { tagId, tagName: first.tagName, color: first.color };
  });
  uniqueChars.sort((a, b) => a.tagName.localeCompare(b.tagName));

  const laneHeight = 30;
  const yMap = {};
  uniqueChars.forEach((char, index) => {
    yMap[char.tagId] = laneHeight * (index + 1);
  });

  const paths = uniqueChars.map((char) => {
    const evs = eventsByChar[char.tagId];
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
        key={char.tagId}
        d={d}
        stroke={char.color}
        strokeWidth="3"
        fill="none"
      />
    );
  });

  const dots = characterEvents.map((e, i) => {
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
  });

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
      <svg width={width} height={height}>
        <line
          x1={marginLeft}
          y1={height - 20}
          x2={width - marginRight}
          y2={height - 20}
          stroke="#000"
          strokeWidth="1"
        />
        {paths}
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
        {(() => {
          const minYear = new Date(minDate).getFullYear();
          const maxYear = new Date(maxDate).getFullYear();
          const gridLines = [];
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
          return gridLines;
        })()}
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
};

export default Plotline;
