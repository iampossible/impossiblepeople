import React, { Component } from "react";
import { Row, Col } from "reactstrap";

export default class Feedback extends Component {
  render() {
    return (
      <Row>
        <Col sm={2} />
        <Col sm={10}>
          <Row>
            <Col sm={2} />
            <Col sm={10}>
              <h1>Feedback</h1>
            </Col>
            <Col sm={2} />
          </Row>
        </Col>
        <Col sm={2} />
      </Row>
    );
  }
}
