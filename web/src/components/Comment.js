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
          <Col sm={10} className="newCommentInputContainer">
            <InputGroup>
              <Input
                id={this.props.postID}
                type="text"
                className="newComment"
                placeholder="Interested? Drop your line here. Hit enter to sent."
                onChange={e => this.props.handleChange(e)}
                onKeyUp={e => this.props.handleKeyUp(e, this.props.postID)}
                value={this.props.newComment}
              />
            </InputGroup>
          </Col>
          <Col sm={1} />
        </Row>
      </Fragment>
    );
  }
}
