import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function AboutModal({ show, onHide }) {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{t("toolbar.aboutTitle")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t("toolbar.aboutBodyLine1")}</p>
        <p>{t("toolbar.aboutBodyLine2")}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
