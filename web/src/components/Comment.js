import React, { Component, Fragment } from "react";
import { Row, Col, InputGroup, Input } from "reactstrap";

export default class Comment extends Component {
  render() {
    return (
      <Fragment>
        <Row className="commentContainer">
          <Col sm={1} className="currentUserAvatar">
            <img src={this.props.user.imageSource} alt="current user" />
          </Col>
          <Col sm={11} className="newCommentInputContainer">
            <InputGroup>
              <Input
                type="text"
                className="newComment"
                placeholder="Interested ?... drop your line here"
                onChange={e => this.props.handleChange(e)}
                onKeyUp={e => this.props.handleKeyUp(e, this.props.postID)}
                value={this.props.newComment}
              />
            </InputGroup>
          </Col>
        </Row>
      </Fragment>
    );
  }
}
