import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import apiService from "../Services/apiService";

export default function NewEventModal({
  show,
  onHide,
  storyId,
  onEventCreated,
}) {
  const { t } = useTranslation();

  const [eventType, setEventType] = useState("dated");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventContent, setEventContent] = useState("");
  const [eventMemoryRefId, setEventMemoryRefId] = useState("");
  const [eventNextEventId, setEventNextEventId] = useState("");
  const [storyEvents, setStoryEvents] = useState([]);

  useEffect(() => {
    if (!storyId) return;
    const fetchEvents = async () => {
      try {
        const resp = await apiService.getPlotEvents(storyId);
        const data = await resp.json();
        setStoryEvents(data);
      } catch (err) {
        console.error("Error fetching story events:", err);
      }
    };
    fetchEvents();
  }, [storyId]);

  const handleSave = async () => {
    if (!storyId) return;
    try {
      const eventDto = {
        eventType,
        title: eventTitle,
        date: eventDate,
        description: eventDescription,
        content: eventContent,
        memoryRefId: eventMemoryRefId || null,
        nextEventId: eventNextEventId || null,
        tags: [],
      };
      const resp = await apiService.addPlotEvent(storyId, eventDto);
      const newEvent = await resp.json();
      onEventCreated && onEventCreated(newEvent);
      // reset
      setEventType("dated");
      setEventTitle("");
      setEventDate("");
      setEventDescription("");
      setEventContent("");
      setEventMemoryRefId("");
      setEventNextEventId("");
      onHide();
    } catch (err) {
      console.error("Error creating new event:", err);
    }
  };

  const handleClose = () => {
    setEventType("dated");
    setEventTitle("");
    setEventDate("");
    setEventDescription("");
    setEventContent("");
    setEventMemoryRefId("");
    setEventNextEventId("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t("newEventModal.title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formEventType" className="mb-3">
            <Form.Label>{t("newEventModal.eventTypeLabel")}</Form.Label>
            <Form.Control
              as="select"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="dated">dated</option>
              <option value="memory">memory</option>
              <option value="undated">undated</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formEventTitle" className="mb-3">
            <Form.Label>{t("newEventModal.titleLabel")}</Form.Label>
            <Form.Control
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formEventDate" className="mb-3">
            <Form.Label>{t("newEventModal.dateLabel")}</Form.Label>
            <Form.Control
              type="text"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formEventDescription" className="mb-3">
            <Form.Label>{t("newEventModal.descriptionLabel")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formEventContent" className="mb-3">
            <Form.Label>{t("newEventModal.contentLabel")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={eventContent}
              onChange={(e) => setEventContent(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formEventMemoryRefId" className="mb-3">
            <Form.Label>{t("newEventModal.memoryRefIdLabel")}</Form.Label>
            <Form.Control
              as="select"
              value={eventMemoryRefId}
              onChange={(e) => setEventMemoryRefId(e.target.value)}
            >
              <option value="">{t("newEventModal.noneOption")}</option>
              {storyEvents.map((ev) => (
                <option key={ev.eventId} value={ev.eventId}>
                  {ev.title}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formEventNextEventId" className="mb-3">
            <Form.Label>{t("newEventModal.nextEventIdLabel")}</Form.Label>
            <Form.Control
              as="select"
              value={eventNextEventId}
              onChange={(e) => setEventNextEventId(e.target.value)}
            >
              <option value="">{t("newEventModal.noneOption")}</option>
              {storyEvents.map((ev) => (
                <option key={ev.eventId} value={ev.eventId}>
                  {ev.title}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t("save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
