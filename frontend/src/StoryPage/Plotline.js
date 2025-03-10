import React from "react";

const parseDate = (dateStr) => {
  return new Date(dateStr.replace(/\./g, "-")).getTime();
};

const Plotline = ({ events, width = 800, height = 300 }) => {
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

  const marginLeft = 60;
  const marginRight = 60;
  const xScale = (date) =>
    marginLeft +
    ((date - minDate) / dateRange) * (width - marginLeft - marginRight);

  const minDateStr = new Date(minDate).toISOString().slice(0, 10);
  const maxDateStr = new Date(maxDate).toISOString().slice(0, 10);

  const eventsByChar = {};
  characterEvents.forEach((e) => {
    if (!eventsByChar[e.tagId]) eventsByChar[e.tagId] = [];
    eventsByChar[e.tagId].push(e);
  });
  Object.keys(eventsByChar).forEach((tagId) => {
    eventsByChar[tagId].sort((a, b) => a.date - b.date);
  });

  const uniqueChars = Object.keys(eventsByChar).map((tagId) => {
    const first = eventsByChar[tagId][0];
    return {
      tagId,
      tagName: first.tagName,
      color: first.color,
    };
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
      if (i === 0) {
        d += `M ${x1} ${y1} `;
      }
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
    return (
      <circle
        key={`${e.eventId}-${e.tagId}-${i}`}
        cx={x}
        cy={y}
        r="7"
        fill={e.color}
      />
    );
  });

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
        key={year}
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
          y={height - 5}
          fontSize="10"
          textAnchor="middle"
          fill="#666"
        >
          {year}
        </text>
      );
    }
  }

  return (
    <svg width={width} height={height}>
      {}
      {gridLines}
      {}
      <line
        x1={marginLeft}
        y1={height - 20}
        x2={width - marginRight}
        y2={height - 20}
        stroke="#000"
        strokeWidth="1"
      />
      {}
      <text
        x={marginLeft}
        y={height - 5}
        fontSize="10"
        fill="#000"
        textAnchor="start"
      >
        {minDateStr}
      </text>
      <text
        x={width - marginRight}
        y={height - 5}
        fontSize="10"
        fill="#000"
        textAnchor="end"
      >
        {maxDateStr}
      </text>
      {paths}
      {dots}
    </svg>
  );
};

export default Plotline;
