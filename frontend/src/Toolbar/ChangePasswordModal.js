import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import apiService from "../Services/apiService";

export default function ChangePasswordModal({ show, onHide }) {
  const { t } = useTranslation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  const [genericError, setGenericError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleChangePassword = async () => {
    setGenericError("");
    setPasswordSuccess("");
    setFieldErrors({});

    if (newPassword !== repeatNewPassword) {
      setFieldErrors({
        repeatNewPassword: t(
          "userOptions.passwordMismatch",
          "New passwords do not match"
        ),
      });
      return;
    }

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
      const validationErrors = Array.isArray(err.body) ? err.body : [];

      if (validationErrors.length > 0) {
        const newFieldErrors = {};
        validationErrors.forEach(({ field, code }) => {
          newFieldErrors[field] = t(code);
        });
        setFieldErrors(newFieldErrors);
      } else {
        setGenericError(
          err.message ||
            t("userOptions.passwordIncorrect", "Incorrect current password")
        );
      }
    }
  };

  const handleClose = () => {
    setGenericError("");
    setPasswordSuccess("");
    setFieldErrors({});
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
        {genericError && <p className="text-danger fw-bold">{genericError}</p>}
        {passwordSuccess && (
          <p className="text-success fw-bold">{passwordSuccess}</p>
        )}
        <Form>
          <Form.Group controlId="oldPassword" className="mb-3">
            <Form.Label>
              {t("userOptions.oldPassword", "Old password")}
            </Form.Label>
            <Form.Control
              type="password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                setFieldErrors((f) => ({ ...f, currentPassword: undefined }));
              }}
              isInvalid={!!fieldErrors.currentPassword}
            />
            <Form.Control.Feedback type="invalid">
              {fieldErrors.currentPassword}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="newPassword" className="mb-3">
            <Form.Label>
              {t("userOptions.newPassword", "New password")}
            </Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setFieldErrors((f) => ({ ...f, newPassword: undefined }));
              }}
              isInvalid={!!fieldErrors.newPassword}
            />
            <Form.Control.Feedback type="invalid">
              {fieldErrors.newPassword}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="repeatNewPassword" className="mb-3">
            <Form.Label>
              {t("userOptions.repeatNewPassword", "Repeat new password")}
            </Form.Label>
            <Form.Control
              type="password"
              value={repeatNewPassword}
              onChange={(e) => {
                setRepeatNewPassword(e.target.value);
                setFieldErrors((f) => ({ ...f, repeatNewPassword: undefined }));
              }}
              isInvalid={!!fieldErrors.repeatNewPassword}
            />
            <Form.Control.Feedback type="invalid">
              {fieldErrors.repeatNewPassword}
            </Form.Control.Feedback>
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
