import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import apiService from "../Services/apiService";

const NON_EDITABLE = ["Character", "Location", "Plot line"];

export default function NewTagModal({
  show,
  onHide,
  onTagCreated,
  storyId,
  tagTypeId,
}) {
  const { t } = useTranslation();

  const [userStories, setUserStories] = useState([]);
  const [tagTypes, setTagTypes] = useState([]);
  const [selectedStoryId, setSelectedStoryId] = useState("");
  const [selectedTagTypeId, setSelectedTagTypeId] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#000000");

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const resp = await apiService.getStories();
        const data = await resp.json();
        setUserStories(data);
        if (
          storyId &&
          data.some((s) => String(s.storyId) === String(storyId))
        ) {
          setSelectedStoryId(storyId);
        } else if (data.length) setSelectedStoryId(data[0].storyId);
      } catch (err) {
        console.error("Error fetching user stories:", err);
      }
    };
    if (show) fetchStories();
  }, [show, storyId]);

  useEffect(() => {
    if (!selectedStoryId) return;
    const fetchTypes = async () => {
      try {
        const resp = await apiService.getTagTypes(selectedStoryId);
        const data = await resp.json();
        setTagTypes(data);
        if (
          tagTypeId &&
          data.some((t) => String(t.tagTypeId) === String(tagTypeId))
        ) {
          setSelectedTagTypeId(tagTypeId);
        } else if (data.length) setSelectedTagTypeId(data[0].tagTypeId);
      } catch (err) {
        console.error("Error fetching tag types:", err);
      }
    };
    fetchTypes();
  }, [selectedStoryId]);

  const handleSave = async () => {
    try {
      const dto = {
        tagName: newTagName,
        tagTypeId: selectedTagTypeId,
        color: newTagColor,
      };
      const resp = await apiService.createTag(selectedStoryId, dto);
      const newTag = await resp.json();
      onTagCreated && onTagCreated(newTag);

      setNewTagName("");
      setNewTagColor("#000000");
      onHide();
    } catch (err) {
      console.error("Error creating new tag:", err);
    }
  };

  const handleClose = () => {
    setNewTagName("");
    setNewTagColor("#000000");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t("newTagModal.title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formSelectStory" className="mb-3">
            <Form.Label>{t("newTagModal.storyLabel")}</Form.Label>
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

          <Form.Group controlId="formTagName" className="mb-3">
            <Form.Label>{t("newTagModal.tagNameLabel")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t("newTagModal.tagNameLabel")}
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formTagType" className="mb-3">
            <Form.Label>{t("newTagModal.tagTypeLabel")}</Form.Label>
            <Form.Control
              as="select"
              value={selectedTagTypeId}
              onChange={(e) => setSelectedTagTypeId(e.target.value)}
            >
              {tagTypes.map((tt) => {
                const isNonEditable = NON_EDITABLE.includes(tt.name);
                const displayName = isNonEditable
                  ? t(`tagTypeRow.${tt.name}`)
                  : tt.name;
                return (
                  <option key={tt.tagTypeId} value={tt.tagTypeId}>
                    {displayName}
                  </option>
                );
              })}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formTagColor" className="mb-3">
            <Form.Label>{t("newTagModal.colorLabel")}</Form.Label>
            <Form.Control
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {t("newTagModal.cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t("newTagModal.save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
