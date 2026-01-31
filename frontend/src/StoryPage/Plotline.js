import React, { useState } from "react";
import apiService from "../Services/apiService";
import { useTranslation } from "react-i18next";
import EditEventModal from "./EditEventModal";

const parseDate = (dateStr, fmtStr) => {
  const fmtSegs = fmtStr.split(".").map(Number);
  const dateSegs = dateStr.split(".").map(Number);

  const mults = fmtSegs.map((_, i) =>
    fmtSegs.slice(i + 1).reduce((acc, x) => acc * x, 1)
  );

  return dateSegs.reduce((sum, seg, i) => sum + seg * mults[i], 0);
};

const Plotline = ({
  events,
  width = 800,
  height = 300,
  onEventUpdated,
  storyId,
  groupBy,
  sortBy,
  dateFormat,
}) => {
  const { t } = useTranslation();

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
          date: parseDate(event.date, dateFormat),
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
    return <div>{t("storyPage.noEventForGroup")}</div>;
  }

  if (sortBy === "date") {
    const allDates = uniqueChars.flatMap((group) =>
      group.events.map((e) => e.date)
    );
    const minDate = Math.min(...allDates);
    const maxDate = Math.max(...allDates);
    const dateRange = maxDate - minDate || 1;

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
      evs.forEach((e, i) => {
        const x = xScale(e.date),
          y = yMap[e.tagId];
        if (i === 0) d += `M ${x} ${y} `;
        else {
          const prev = evs[i - 1];
          const x0 = xScale(prev.date),
            y0 = y;
          const offset = (x - x0) / 3;
          d += `C ${x0 + offset} ${y0}, ${x - offset} ${y}, ${x} ${y} `;
        }
      });
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
            fill={group.color}
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
    const fmtSegs = dateFormat.split(".").map(Number);
    const mults = fmtSegs.map((_, i) =>
      fmtSegs.slice(i + 1).reduce((acc, x) => acc * x, 1)
    );
    const minYear = Math.floor(minDate / mults[0]);
    const maxYear = Math.floor(maxDate / mults[0]);
    const totalYears = maxYear - minYear + 1;
    const step = totalYears > 10 ? Math.ceil(totalYears / 10) : 1;
    for (let year = minYear; year <= maxYear; year += step) {
      const val = year * mults[0];
      const x = xScale(val);
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
            {minYear}
          </text>
          <text
            x={width - marginRight}
            y={height - 5}
            fontSize="10"
            fill="#000"
            textAnchor="end"
          >
            {maxYear}
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
    const marginTop = 60;
    const marginLeft = 50;
    const marginRight = 130;
    const spacing = 100;
    const groupedOrdered = {};
    events.forEach((event) => {
      event.tags.forEach((tag) => {
        if (Number(tag.tagTypeId) === Number(groupBy)) {
          if (!groupedOrdered[tag.tagId]) groupedOrdered[tag.tagId] = [];
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

    const storyEvents = events.filter((evt) =>
      evt.tags.some((tag) => Number(tag.tagTypeId) === Number(groupBy))
    );
    const eventIndexMap = {};
    storyEvents.forEach((evt, idx) => {
      eventIndexMap[evt.eventId] = idx;
    });

    const laneHeight = 40;
    const yMap = {};
    uniqueGroups.forEach((group, idx) => {
      yMap[group.tagId] = laneHeight * (idx + 1);
    });

    const computedWidth =
      marginLeft + marginRight + spacing * (storyEvents.length - 1);

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

    const gridLines = storyEvents.map((_, idx) => {
      const x = marginLeft + idx * spacing;
      return (
        <line
          key={`vline-${idx}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="#ccc"
          strokeWidth="1"
        />
      );
    });

    const paths = uniqueGroups.map((group) => {
      const evs = group.events
        .filter((e) => eventIndexMap.hasOwnProperty(e.eventId))
        .sort((a, b) => eventIndexMap[a.eventId] - eventIndexMap[b.eventId]);
      if (evs.length < 2) return null;

      let d = "";
      evs.forEach((e, i) => {
        const x = marginLeft + eventIndexMap[e.eventId] * spacing;
        const y = marginTop + yMap[group.tagId];
        if (i === 0) {
          d += `M ${x} ${y} `;
        } else {
          const prev = evs[i - 1];
          const prevX = marginLeft + eventIndexMap[prev.eventId] * spacing;
          const offset = (x - prevX) / 3;
          d += `C ${prevX + offset} ${y}, ${x - offset} ${y}, ${x} ${y} `;
        }
      });

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
      group.events.map((e) => {
        const idx = eventIndexMap[e.eventId];
        const x = marginLeft + idx * spacing;
        const y = marginTop + yMap[group.tagId];
        const isHighlighted = hoveredEventId === e.eventId;
        return (
          <g key={`${e.eventId}-${group.tagId}`}>
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
            <text
              transform={`rotate(-45 ${x + 10} ${y})`}
              x={x + 12}
              y={y - 5}
              fontSize="11"
              fontWeight="100"
              fill="#0B2A61"
            >
              {e.title}
            </text>
          </g>
        );
      })
    );

    return (
      <>
        <svg width={computedWidth} height={height}>
          {gridLines}
          {/* baseline */}
          <line
            x1={marginLeft}
            y1={height}
            x2={computedWidth - marginRight}
            y2={height}
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
