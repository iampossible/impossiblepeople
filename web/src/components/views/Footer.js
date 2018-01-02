import React, { Component } from "react";
import { Container, Row, Col } from "reactstrap";

export default class Footer extends Component {
  render() {
    return (
      <Container>
        <Row>
          <Col xs={4} />
          <Col xs={2}>
            <p id="termsOfUse">
              <a href="#">Terms of user</a>
            </p>
          </Col>
          <Col xs={2}>
            <p id="privacyPlicy">
              <a href="#">Privacy Policy</a>
            </p>
          </Col>
          <Col xs={2} />
          <Col xs={2}>
            <p id="footerCopyright">
              <span>We Are One</span>&nbsp;
              <i className="fa fa-copyright" aria-hidden="true" /> 2018
            </p>
          </Col>
        </Row>
      </Container>
    );
  }
}
