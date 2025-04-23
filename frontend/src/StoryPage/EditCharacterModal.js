import React from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./StoryPage.css";

const EditCharacterModal = ({
  show,
  onHide,
  characterData,
  loading,
  error,
  onChangeField,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{t("character.details")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}
        {characterData && (
          <>
            <div className="form-group">
              <label>{t("character.name")}</label>
              <input
                className="form-control"
                value={characterData.name}
                onChange={(e) => onChangeField("name", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>{t("character.shortDescription")}</label>
              <textarea
                className="form-control"
                rows={3}
                value={characterData.short_description}
                onChange={(e) =>
                  onChangeField("short_description", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>{t("character.description")}</label>
              <textarea
                className="form-control"
                rows={5}
                value={characterData.description}
                onChange={(e) => onChangeField("description", e.target.value)}
              />
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={onSave} disabled={loading}>
          {t("save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditCharacterModal;
