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
            <a href="/userAgreement" target="_blank">
              User Agreement
            </a>
          </p>
        </Col>
        <Col sm={2} id="privacyPlicy">
          <p>
            <a href="/privacyPolicy" target="_blank">
              Privacy Policy
            </a>
          </p>
        </Col>
        <Col sm={2} id="faq">
          <p>
            <a href="/faq" target="_blank">
              FAQ
            </a>
          </p>
        </Col>

        <Col sm={2} id="feedback">
          <p>
            <a href="/feedback" target="_blank">
              Feedback
            </a>
          </p>
        </Col>
      </Fragment>
    );
  }
}
