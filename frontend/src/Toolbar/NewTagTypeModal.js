import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import apiService from "../Services/apiService";

export default function NewTagTypeModal({
  show,
  onHide,
  onTagTypeCreated,
  storyId,
}) {
  const { t } = useTranslation();

  const [userStories, setUserStories] = useState([]);
  const [selectedStoryId, setSelectedStoryId] = useState("");
  const [newTagTypeName, setNewTagTypeName] = useState("");

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const resp = await apiService.getStories();
        const data = await resp.json();
        setUserStories(data);
        if (
          storyId &&
          data.some((s) => parseInt(s.storyId) === parseInt(storyId))
        ) {
          setSelectedStoryId(storyId);
        } else if (data.length) setSelectedStoryId(data[0].storyId);
      } catch (err) {
        console.error("Error fetching user stories:", err);
      }
    };
    if (show) fetchStories();
  }, [show, storyId]);

  const handleSave = async () => {
    try {
      const dto = { name: newTagTypeName };
      const resp = await apiService.createTagType(selectedStoryId, dto);
      const newTagType = await resp.json();
      onTagTypeCreated && onTagTypeCreated(newTagType);

      setNewTagTypeName("");
      onHide();
    } catch (err) {
      console.error("Error creating new tag type:", err);
    }
  };

  const handleClose = () => {
    setNewTagTypeName("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t("newTagTypeModal.title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formSelectStoryForTagType" className="mb-3">
            <Form.Label>{t("newTagTypeModal.storyLabel")}</Form.Label>
            <Form.Control
              as="select"
              value={selectedStoryId}
              onChange={(e) => setSelectedStoryId(e.target.value)}
            >
              {userStories.map((s) => (
                <option key={s.storyId} value={s.storyId}>
                  {s.title}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formTagTypeName" className="mb-3">
            <Form.Label>{t("newTagTypeModal.tagTypeNameLabel")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t("newTagTypeModal.tagTypeNameLabel")}
              value={newTagTypeName}
              onChange={(e) => setNewTagTypeName(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {t("newTagTypeModal.cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t("newTagTypeModal.save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
