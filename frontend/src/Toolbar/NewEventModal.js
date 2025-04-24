import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Badge,
  InputGroup,
  ListGroup,
} from "react-bootstrap";
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
  const [eventPrevEventId, setEventPrevEventId] = useState("");
  const [isInPlot, setIsInPlot] = useState(true);
  const [storyEvents, setStoryEvents] = useState([]);

  const [tagTypes, setTagTypes] = useState([]);
  const [tags, setTags] = useState([]);

  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef();

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!show || !storyId) return;
    apiService
      .getTagTypes(storyId)
      .then((r) => r.json())
      .then(setTagTypes);
    apiService
      .getTags(storyId)
      .then((r) => r.json())
      .then(setTags);
    apiService
      .getPlotEvents(storyId)
      .then((r) => r.json())
      .then(setStoryEvents);
  }, [show, storyId]);

  useEffect(() => {
    if (eventType === "dated" || eventType === "undated") {
      setEventMemoryRefId("");
    }
    if (eventType === "undated") {
      setEventDate("");
    }
    setErrors({});
  }, [eventType]);

  useEffect(() => {
    if (!isInPlot) {
      setEventPrevEventId("");
    }
  }, [isInPlot]);

  const resetAll = () => {
    setEventType("dated");
    setEventTitle("");
    setEventDate("");
    setEventDescription("");
    setEventContent("");
    setEventMemoryRefId("");
    setEventPrevEventId("");
    setIsInPlot(true);
    setSelectedTagIds([]);
    setSearchTerm("");
    setErrors({});
  };
  const handleClose = () => {
    resetAll();
    onHide();
  };

  const validate = () => {
    const errs = {};
    if (!eventTitle.trim()) {
      errs.title = t("errors.titleRequired", "Title is required");
    }
    if (
      (eventType === "dated" || eventType === "memory") &&
      !eventDate.trim()
    ) {
      errs.date = t("errors.dateRequired", "Date is required");
    }
    if (eventType === "memory" && !eventMemoryRefId) {
      errs.memoryRef = t(
        "errors.memoryRefRequired",
        "Memory reference is required"
      );
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev : [...prev, tagId]
    );
    setSearchTerm("");
    setShowSuggestions(false);
    inputRef.current.focus();
  };
  const removeTag = (tagId) =>
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));

  const suggestions = tagTypes
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((tt) => {
      const items = tags
        .filter(
          (tag) =>
            tag.tagTypeId === tt.tagTypeId &&
            !selectedTagIds.includes(tag.tagId) &&
            (searchTerm === "" ||
              tag.tagName.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => a.tagName.localeCompare(b.tagName));
      return items.length ? { tagType: tt, items } : null;
    })
    .filter(Boolean);

  const handleSave = async () => {
    if (!storyId) return;
    if (!validate()) return;

    const eventDto = {
      eventType,
      title: eventTitle,
      date: eventType === "undated" ? null : eventDate,
      description: eventDescription,
      content: eventContent,
      memoryRefId:
        eventType === "dated" || eventType === "undated"
          ? null
          : eventMemoryRefId,
      prevEventId: isInPlot ? eventPrevEventId || null : null,
      isInPlot,
      tags: selectedTagIds,
    };
    try {
      const resp = await apiService.addPlotEvent(storyId, eventDto);
      const newEvent = await resp.json();
      onEventCreated?.(newEvent);
      handleClose();
    } catch (err) {
      console.error("Error creating new event:", err);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t("newEventModal.title")}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {}
          <Form.Group controlId="formEventType" className="mb-3">
            <Form.Label>{t("newEventModal.eventTypeLabel")}</Form.Label>
            <Form.Control
              as="select"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="dated">{t("newEventModal.dated")}</option>
              <option value="memory">{t("newEventModal.memory")}</option>
              <option value="undated">{t("newEventModal.undated")}</option>
            </Form.Control>
          </Form.Group>

          {}
          <Form.Group controlId="formEventTitle" className="mb-3">
            <Form.Label>{t("newEventModal.titleLabel")}</Form.Label>
            <Form.Control
              type="text"
              value={eventTitle}
              isInvalid={!!errors.title}
              onChange={(e) => {
                setEventTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: null }));
              }}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>

          {}
          <Form.Group controlId="formEventDate" className="mb-3">
            <Form.Label>{t("newEventModal.dateLabel")}</Form.Label>
            <Form.Control
              type="text"
              placeholder="1500.01.01"
              value={eventDate}
              isInvalid={!!errors.date}
              disabled={eventType === "undated"}
              onChange={(e) => {
                setEventDate(e.target.value);
                setErrors((prev) => ({ ...prev, date: null }));
              }}
            />
            <Form.Control.Feedback type="invalid">
              {errors.date}
            </Form.Control.Feedback>
          </Form.Group>

          {}
          <Form.Group controlId="formEventDescription" className="mb-3">
            <Form.Label>{t("newEventModal.descriptionLabel")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
            />
          </Form.Group>

          {}
          <Form.Group controlId="formEventContent" className="mb-3">
            <Form.Label>{t("newEventModal.contentLabel")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={eventContent}
              onChange={(e) => setEventContent(e.target.value)}
            />
          </Form.Group>

          {}
          <Form.Group
            controlId="formEventTags"
            className="mb-3"
            style={{ position: "relative" }}
          >
            <Form.Label>{t("newEventModal.tagsLabel", "Tags")}</Form.Label>
            <div className="mb-2">
              {selectedTagIds.map((id) => {
                const tag = tags.find((t) => t.tagId === id);
                return (
                  <Badge
                    key={id}
                    pill
                    bg="secondary"
                    className="me-1"
                    style={{ cursor: "pointer" }}
                    onClick={() => removeTag(id)}
                  >
                    {tag?.tagName} &times;
                  </Badge>
                );
              })}
            </div>

            <InputGroup>
              <Form.Control
                placeholder={t(
                  "newEventModal.searchPlaceholder",
                  "Search tags..."
                )}
                value={searchTerm}
                ref={inputRef}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
            </InputGroup>

            {showSuggestions && suggestions.length > 0 && (
              <ListGroup className="tags-suggestion-dropdown">
                {suggestions.map(({ tagType, items }) => (
                  <React.Fragment key={tagType.tagTypeId}>
                    <ListGroup.Item
                      variant="light"
                      className="fw-bold"
                      style={{ cursor: "default" }}
                    >
                      {tagType.name}
                    </ListGroup.Item>
                    {items.map((tag) => (
                      <ListGroup.Item
                        key={tag.tagId}
                        action
                        onMouseDown={() => addTag(tag.tagId)}
                      >
                        {tag.tagName}
                      </ListGroup.Item>
                    ))}
                  </React.Fragment>
                ))}
              </ListGroup>
            )}
          </Form.Group>

          {}
          <Form.Group controlId="formEventMemoryRefId" className="mb-3">
            <Form.Label>{t("newEventModal.memoryRefIdLabel")}</Form.Label>
            <Form.Control
              as="select"
              value={eventMemoryRefId}
              isInvalid={!!errors.memoryRef}
              disabled={eventType === "dated" || eventType === "undated"}
              onChange={(e) => {
                setEventMemoryRefId(e.target.value);
                setErrors((prev) => ({ ...prev, memoryRef: null }));
              }}
            >
              <option value="">{t("newEventModal.noneOption")}</option>
              {storyEvents.map((ev) => (
                <option key={ev.eventId} value={ev.eventId}>
                  {ev.title}
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.memoryRef}
            </Form.Control.Feedback>
          </Form.Group>

          {}
          <Form.Group controlId="formEventPrevEventId" className="mb-3">
            <Form.Label>{t("newEventModal.prevEventIdLabel")}</Form.Label>
            <Form.Control
              as="select"
              value={eventPrevEventId}
              onChange={(e) => setEventPrevEventId(e.target.value)}
              disabled={!isInPlot}
            >
              <option value="">{t("newEventModal.noneOption")}</option>
              {storyEvents.map((ev) => (
                <option key={ev.eventId} value={ev.eventId}>
                  {ev.title}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formEventIsInPlot" className="mb-3">
            <Form.Check
              type="checkbox"
              label={t("newEventModal.isInPlotLabel", "Include in the plot")}
              checked={isInPlot}
              onChange={(e) => setIsInPlot(e.target.checked)}
            />
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
