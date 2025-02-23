import React, { useEffect, useState } from "react";
import apiService from "../Services/apiService";
import { ListGroup, Container, Row, Col } from "react-bootstrap";

const Homepage = () => {
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await apiService.getStories();
        if (response.ok) {
          const data = await response.json();
          setStories(data);
        } else {
          setError("Failed to load stories.");
        }
      } catch (err) {
        setError("Error fetching stories.");
      }
    };

    fetchStories();
  }, []);

  return (
    <Container>
      <Row className="mt-4">
        <Col>
          <h1>Homepage</h1>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {stories.length === 0 ? (
            <p>No stories available.</p>
          ) : (
            <ListGroup>
              {stories.map((story) => (
                <ListGroup.Item key={story.storyId}>
                  <strong>{story.title}</strong>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Homepage;
