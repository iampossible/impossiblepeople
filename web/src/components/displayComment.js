import React, { Component } from "react";
import { Row, Col } from "reactstrap";

class DisplayComment extends Component {
  render() {
    let comment =this.props.comment;
    return (
      <Row key={comment.commentID}>
        <div className="  col-md-5 col-lg-1"/>
        <div className="feedColor col-sm-4 col-md-5 col-lg-2">{comment.author}</div>
        <div className="feedComment col-sm-8 col-md-5 col-lg-9">{comment.content}</div>
      </Row>
      );
  }
}

export default DisplayComment;