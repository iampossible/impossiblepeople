import React, { Component } from "react";
import { Row, Col, Tooltip } from "reactstrap";
import "bootstrap/dist/css/bootstrap.css";
import * as moment from "moment";
import currentUserAvatar from "../assets/images/profile.png";

class DisplayPost extends Component {
  state = {
    updateTooltipOpen: false,
    deleteTooltipOpen: false
  };

  toggleUpdatePost = () => {
    this.setState({
      updateTooltipOpen: !this.state.updateTooltipOpen
    });
  };

  toggleDeletePost = () => {
    this.setState({
      deleteTooltipOpen: !this.state.deleteTooltipOpen
    });
  };

  render() {
    const postData = this.props.postData;
    const user = this.props.user;
    return (
      <Row xs={12}>
        <Col sm={3} xs={12}>
          <Row className="feedPhoto">
            <img
              className="img-fluid feedPhoto"
              src={postData.author.imageSource || currentUserAvatar}
              alt="profile"
            />
            <blockquote className="blockquote">
              <footer className="blockquote-footer">
                <span className="feedAuthor">
                  <i className="fa fa-sm fa-chevron-right" aria-hidden="true" />
                  &nbsp;
                  {postData.author.username}
                </span>&nbsp;
                <p className="feedPostType">{postData.postType}</p>
              </footer>
            </blockquote>
          </Row>
        </Col>
        <Col className="feedBody" sm={9} xs={12}>
          <Row>
            <Col xs={12}>
              {postData.author.userID === user.userID ? (
                <Row xs={12}>
                  <Col xs={10} />
                  <Col xs={2} className="updateDeletePostButtonsContainer">
                    <a
                      id="ToolTipUpdateIcon"
                      className="updatePostIcon"
                      href="#post"
                      onClick={() =>
                        this.props.handlePostUpdate(postData.postID)
                      }>
                      <i className="material-icons">edit</i>
                    </a>
                    <Tooltip
                      placement="left"
                      isOpen={this.state.updateTooltipOpen}
                      target="ToolTipUpdateIcon"
                      toggle={this.toggleUpdatePost}>
                      Update Post
                    </Tooltip>
                    <a
                      id="TooltipDeleteIcon"
                      className="deletePostIcon"
                      onClick={() =>
                        this.props.handlePostDelete(postData.postID)
                      }>
                      <i className="material-icons">clear</i>
                    </a>
                    <Tooltip
                      placement="right"
                      isOpen={this.state.deleteTooltipOpen}
                      target="TooltipDeleteIcon"
                      toggle={this.toggleDeletePost}>
                      Delete Post
                    </Tooltip>
                  </Col>
                </Row>
              ) : null}
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <blockquote className="blockquote">
                <p className="feedContent">{postData.content}</p>
                <footer className="blockquote-footer">
                  <cite title="Source Title">
                    <Row>
                      <Col xs={1} className="feedTagsIcon">
                        <span>
                          <i className="fa fa-sm fa-tag" aria-hidden="true" />
                        </span>
                      </Col>
                      <Col xs={11}>
                        <p className="feedTags">
                          {/* if the post has more than one tag/interest */}
                          <span>
                            {postData.interests
                              .map(interest => interest.name)
                              .join(" / ")}
                          </span>
                        </p>
                      </Col>
                      <Col xs={1} className="feedLocationIcon">
                        <span>
                          <i className="fa fa-map-marker" aria-hidden="true" />
                        </span>
                      </Col>
                      <Col xs={11}>
                        <p className="feedLocation">{postData.location}</p>
                      </Col>
                      <Col xs={1} className="feedCreatedAtIcon">
                        <span>
                          <i className="fa fa-calendar" />
                        </span>
                      </Col>
                      <Col xs={11}>
                        <p className="feedCreatedAt">
                          {moment(postData.createdAt).format("MMM Do, YYYY")}&nbsp;
                        </p>
                      </Col>
                    </Row>
                  </cite>
                </footer>
              </blockquote>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default DisplayPost;
