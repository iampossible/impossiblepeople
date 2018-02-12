import React, { Component } from "react";
import { Row, Col } from "reactstrap";

export default class PrivacyPolicy extends Component {
  render() {
    return (
      <Row>
        <Col sm={2} />
        <Col sm={10}>
          <Row>
            <Col sm={2} />
            <Col sm={10}>
              <h1>Privacy Policy</h1>
            </Col>
            <Col sm={2} />
          </Row>
        </Col>
        <Col sm={2} />
      </Row>
    );
  }
}
