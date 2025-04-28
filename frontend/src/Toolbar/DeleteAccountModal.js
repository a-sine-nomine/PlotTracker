import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import apiService from "../Services/apiService";

export default function DeleteAccountModal({ show, onHide }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [deleteAccountError, setDeleteAccountError] = useState("");

  const handleDeleteAccount = async () => {
    setDeleteAccountError("");
    try {
      await apiService.deleteUser({ password: deleteAccountPassword });
      navigate("/register");
    } catch (err) {
      setDeleteAccountError(
        err.message ||
          t("userOptions.deleteAccountError", "Password is incorrect")
      );
    }
  };

  const handleClose = () => {
    setDeleteAccountPassword("");
    setDeleteAccountError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {t("userOptions.deleteAccount", "Delete account")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {t(
            "userOptions.deleteAccountWarning",
            "This action is permanent. Please enter your password to confirm account deletion."
          )}
        </p>
        {deleteAccountError && (
          <p className="error-message">{deleteAccountError}</p>
        )}
        <Form.Group controlId="deleteAccountPassword" className="mb-3">
          <Form.Label>{t("userOptions.password", "Password")}</Form.Label>
          <Form.Control
            type="password"
            value={deleteAccountPassword}
            onChange={(e) => setDeleteAccountPassword(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {t("cancel", "Cancel")}
        </Button>
        <Button variant="danger" onClick={handleDeleteAccount}>
          {t("userOptions.delete", "Delete")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
