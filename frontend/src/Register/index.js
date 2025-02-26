import React, { useState } from "react";
import { Button, Container, Row, Col, Form, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserProvider";
import apiService from "../Services/apiService";
import "./Register.css";

const Register = () => {
  const { setIsAuthenticated } = useUser();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const sendRegisterRequest = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await apiService.register(username, password);

      if (response.status === 201) {
        setSuccessMsg("Registration successful! You can now log in.");
      } else {
        setErrorMsg("Something went wrong, please try again later.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMsg(error.message || "An error occurred during registration.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card
        className="p-4 shadow"
        style={{ borderRadius: "1rem", minWidth: "350px" }}
      >
        <Card.Body>
          <h1
            className="text-center mb-4"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            PlotTracker
          </h1>
          <p className="text-center text-muted mb-4">
            Create a new account to start tracking your stories.
          </p>

          <Form.Group className="mb-3" controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
            />
          </Form.Group>

          {errorMsg && (
            <div className="text-danger mb-3" style={{ fontWeight: "bold" }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="text-success mb-3" style={{ fontWeight: "bold" }}>
              {successMsg}
            </div>
          )}

          <div className="d-grid">
            <Button variant="primary" onClick={sendRegisterRequest}>
              Sign Up
            </Button>
          </div>

          <div className="text-center mt-3">
            <small className="text-muted">
              Already have an account?{" "}
              <span
                className="text-primary text-decoration-underline"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/login")}
              >
                Log in
              </span>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;
