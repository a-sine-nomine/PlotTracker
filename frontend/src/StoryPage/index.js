// src/StoryPage.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiService from "../Services/apiService";
import "./StoryPage.css";

const StoryPage = () => {
  const { storyId } = useParams();
  const [plotEvents, setPlotEvents] = useState([]);

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

  return (
    <div className="storypage-container">
      <div className="left-panel">
        {}
        <h4>Story {storyId}</h4>
      </div>
      <div className="center-panel">
        {plotEvents.length > 0 ? (
          plotEvents.map((event) => (
            <div key={event.eventId} className="plot-event">
              <h5>{event.title}</h5>
              {event.description && <p>{event.description}</p>}
              {}
            </div>
          ))
        ) : (
          <p>No plot events available for this story.</p>
        )}
      </div>
    </div>
  );
};

export default StoryPage;
