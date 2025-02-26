import React, { useState } from "react";
import { Button, Container, Row, Col, Form, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserProvider";
import apiService from "../Services/apiService";
import "./Login.css";

const Login = () => {
  const { setIsAuthenticated } = useUser();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  const sendLoginRequest = async () => {
    setErrorMsg("");
    try {
      await apiService.login(username, password);
      setIsAuthenticated(true);
      navigate("/homepage");
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMsg(error.message || "An error occurred during login.");
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
            Log in to your account to view your stories.
          </p>

          <Form.Group className="mb-3" controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Your password"
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

          <div className="d-grid">
            <Button variant="primary" onClick={sendLoginRequest}>
              Login
            </Button>
          </div>

          <div className="text-center mt-3">
            <small className="text-muted">
              Don&#39;t have an account?{" "}
              <span
                className="text-primary text-decoration-underline"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/register")}
              >
                Sign up
              </span>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
