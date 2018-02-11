import React, { Component, Fragment } from "react";
import { Col } from "reactstrap";

export default class Footer extends Component {
  render() {
    return (
      <Fragment>
        <Col sm={1} />
        <Col sm={3} id="poweredby">
          <p>
            powered by&nbsp;&nbsp;&nbsp;&nbsp;
            <a href="#">
              <i>Impossible</i>
            </a>
          </p>
        </Col>
        <Col sm={2} id="userAggreement">
          <p>
            <a href="#">User Agreement</a>
          </p>
        </Col>
        <Col sm={2} id="privacyPlicy">
          <p>
            <a href="#">Privacy Policy</a>
          </p>
        </Col>
        <Col sm={2} id="faq">
          <p>
            <a href="#">FAQ</a>
          </p>
        </Col>

        <Col sm={2} id="feedback">
          <p>
            <a href="#">Feedback</a>
          </p>
        </Col>
      </Fragment>
    );
  }
}
