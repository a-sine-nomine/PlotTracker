import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import apiService from "../Services/apiService";

const NON_EDITABLE = ["Character", "Location", "Plot line"];

export default function EditTagModal({
  show,
  onHide,
  storyId,
  tag,
  onTagUpdated,
}) {
  const { t } = useTranslation();

  const [tagTypes, setTagTypes] = useState([]);
  const [newTagName, setNewTagName] = useState(tag.tagName);
  const [newTagColor, setNewTagColor] = useState(tag.color);
  const [newTagTypeId, setNewTagTypeId] = useState(tag.tagTypeId);

  useEffect(() => {
    if (!show) return;
    (async () => {
      try {
        const resp = await apiService.getTagTypes(storyId);
        const data = await resp.json();
        setTagTypes(data);
        setNewTagTypeId(tag.tagTypeId);
      } catch (err) {
        console.error("Error fetching tag types:", err);
      }
    })();
  }, [show, storyId, tag.tagTypeId]);

  const handleSave = async () => {
    try {
      const dto = {
        tagName: newTagName,
        tagTypeId: newTagTypeId,
        color: newTagColor,
      };
      const resp = await apiService.updateTag(storyId, tag.tagId, dto);
      const updated = await resp.json();
      onTagUpdated && onTagUpdated(updated);
      onHide();
    } catch (err) {
      console.error("Error updating tag:", err);
    }
  };

  const handleClose = () => {
    setNewTagName(tag.tagName);
    setNewTagColor(tag.color);
    setNewTagTypeId(tag.tagTypeId);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t("editTagModal.title", "Edit Tag")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {}
          <Form.Group controlId="formEditTagName" className="mb-3">
            <Form.Label>{t("editTagModal.nameLabel", "Name")}</Form.Label>
            <Form.Control
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
          </Form.Group>

          {}
          <Form.Group controlId="formEditTagType" className="mb-3">
            <Form.Label>{t("editTagModal.typeLabel", "Type")}</Form.Label>
            <Form.Control
              as="select"
              value={newTagTypeId}
              onChange={(e) => setNewTagTypeId(e.target.value)}
            >
              {tagTypes.map((tt) => {
                const isNon = NON_EDITABLE.includes(tt.name);
                const displayName = isNon
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

          {}
          <Form.Group controlId="formEditTagColor" className="mb-3">
            <Form.Label>{t("editTagModal.colorLabel", "Color")}</Form.Label>
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
          {t("cancel", "Cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t("save", "Save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
