import React, { Component } from "react";
import { Container, Row, Col } from "reactstrap";

export default class Footer extends Component {
  render() {
    return (
      <Container id="footer">
        <Row>
          <Col sm={4} className="d-none d-sm-block" />
          <Col xs={4} sm={2} id="termsOfUse">
            <p>
              <a href="#">Terms of user</a>
            </p>
          </Col>
          <Col xs={5} sm={2} id="privacyPlicy">
            <p>
              <a href="#">Privacy Policy</a>
            </p>
          </Col>
          <Col sm={1} className="d-none d-sm-block" />
          <Col xs={3} sm={3} id="footerCopyright">
            <p>
              <span className="d-none d-sm-inline">We Are One</span>&nbsp;
              <i className="fa fa-copyright" aria-hidden="true" />&nbsp;
              {new Date().getFullYear()}
            </p>
          </Col>
        </Row>
      </Container>
    );
  }
}
