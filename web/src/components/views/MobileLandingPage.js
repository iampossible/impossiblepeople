import React, { Component } from "react";
import { Row, Col } from "reactstrap";

function MobileLandingPage(props) {
  return (
    <Row className="mobile-landing" id="landingPageInfo">
      <img
        id="LandingHeader"
        src="https://humankind-assets.s3.eu-west-1.amazonaws.com/post/GompTy5bPN3G9"
      />
      <Col xs={12}>
        <h4>Mobile Version </h4>
        <h3>IS Coming</h3>
        <h4>Soon !!</h4>
      </Col>
    </Row>
  );
}
export default MobileLandingPage;
