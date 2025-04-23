import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import apiService from "../Services/apiService";

export default function ChangePasswordModal({ show, onHide }) {
  const { t } = useTranslation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleChangePassword = async () => {
    if (newPassword !== repeatNewPassword) {
      setPasswordError(
        t("userOptions.passwordMismatch", "New passwords do not match")
      );
      return;
    }
    setPasswordError("");
    setPasswordSuccess("");

    try {
      await apiService.changePassword({
        currentPassword: oldPassword,
        newPassword,
      });
      setPasswordSuccess(
        t("userOptions.passwordChanged", "Password changed successfully")
      );
      setOldPassword("");
      setNewPassword("");
      setRepeatNewPassword("");
    } catch (err) {
      setPasswordError(
        err.message ||
          t("userOptions.passwordIncorrect", "Incorrect current password")
      );
    }
  };

  const handleClose = () => {
    setPasswordError("");
    setPasswordSuccess("");
    setOldPassword("");
    setNewPassword("");
    setRepeatNewPassword("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {t("userOptions.changePassword", "Change password")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {passwordError && <p className="error-message">{passwordError}</p>}
        {passwordSuccess && (
          <p className="success-message">{passwordSuccess}</p>
        )}
        <Form>
          <Form.Group controlId="oldPassword" className="mb-3">
            <Form.Label>
              {t("userOptions.oldPassword", "Old password")}
            </Form.Label>
            <Form.Control
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="newPassword" className="mb-3">
            <Form.Label>
              {t("userOptions.newPassword", "New password")}
            </Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="repeatNewPassword" className="mb-3">
            <Form.Label>
              {t("userOptions.repeatNewPassword", "Repeat new password")}
            </Form.Label>
            <Form.Control
              type="password"
              value={repeatNewPassword}
              onChange={(e) => setRepeatNewPassword(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {t("cancel", "Cancel")}
        </Button>
        <Button variant="primary" onClick={handleChangePassword}>
          {t("userOptions.change", "Change")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
