import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import apiService from "../Services/apiService";
import { useTranslation } from "react-i18next";

const EditEventModal = ({
  show,
  onHide,
  eventData,
  storyId,
  onEventUpdated,
}) => {
  const { t } = useTranslation();
  const [eventType, setEventType] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [memoryRefId, setMemoryRefId] = useState("");
  const [nextEventId, setNextEventId] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    if (eventData) {
      setEventType(eventData.eventType);
      setTitle(eventData.title);
      setDate(eventData.date);
      setDescription(eventData.description || "");
      setContent(eventData.content || "");
      setMemoryRefId(eventData.memoryRefId || "");
      setNextEventId(eventData.nextEventId || "");
      if (eventData.tags && eventData.tags.length > 0) {
        setTagsInput(eventData.tags.map((t) => t.tagName).join(", "));
      } else {
        setTagsInput("");
      }
    }
  }, [eventData]);

  useEffect(() => {
    if (storyId) {
      apiService
        .getTags(storyId)
        .then((response) => response.json())
        .then((data) => setAvailableTags(data))
        .catch((error) =>
          console.error("Error fetching available tags:", error)
        );
    }
  }, [storyId]);

  const convertTagsToIds = () => {
    if (!availableTags || availableTags.length === 0) return [];
    return tagsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map((tagName) => {
        const found = availableTags.find(
          (t) => t.tagName.toLowerCase() === tagName.toLowerCase()
        );
        return found ? found.tagId : null;
      })
      .filter((id) => id !== null);
  };

  const handleSave = async () => {
    const tagIds = convertTagsToIds();
    const plotEventDto = {
      eventType,
      title,
      date,
      description,
      content,
      memoryRefId: memoryRefId || null,
      nextEventId: nextEventId || null,
      tags: tagIds,
    };

    try {
      const response = await apiService.updatePlotEvent(
        eventData.eventId,
        plotEventDto
      );
      const updatedEvent = await response.json();
      if (onEventUpdated) {
        onEventUpdated(updatedEvent);
      }
      onHide();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{t("editEventModal.title", "Edit Event")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="editEventType" className="mb-3">
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
          <Form.Group controlId="editEventTitle" className="mb-3">
            <Form.Label>{t("newEventModal.titleLabel")}</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="editEventDate" className="mb-3">
            <Form.Label>{t("newEventModal.dateLabel")}</Form.Label>
            <Form.Control
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="editEventDescription" className="mb-3">
            <Form.Label>{t("newEventModal.descriptionLabel")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="editEventContent" className="mb-3">
            <Form.Label>{t("newEventModal.contentLabel")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="editEventMemoryRefId" className="mb-3">
            <Form.Label>{t("newEventModal.memoryRefIdLabel")}</Form.Label>
            <Form.Control
              type="text"
              value={memoryRefId}
              onChange={(e) => setMemoryRefId(e.target.value)}
              placeholder="Optional"
            />
          </Form.Group>
          <Form.Group controlId="editEventNextEventId" className="mb-3">
            <Form.Label>{t("newEventModal.nextEventIdLabel")}</Form.Label>
            <Form.Control
              type="text"
              value={nextEventId}
              onChange={(e) => setNextEventId(e.target.value)}
              placeholder="Optional"
            />
          </Form.Group>
          <Form.Group controlId="editEventTags" className="mb-3">
            <Form.Label>{t("newEventModal.tagsLabel")}</Form.Label>
            <Form.Control
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t("newEventModal.tagsPlaceholder")}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t("save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditEventModal;
