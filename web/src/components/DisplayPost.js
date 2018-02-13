import React, { Component, Fragment } from "react";
import { Row, Col, Tooltip } from "reactstrap";
import DisplayComment from "./DisplayComment";

class DisplayPost extends Component {
  state = {
    loadComment: "",
    showComments: false
  };

  toggleComment = e => {
    let commentsDisplayed = this.state.commentsDisplayed;
    if (!commentsDisplayed) {
      this.setState({
        loadComment: !this.state.loadComment,
        showComments: true,
        commentsDisplayed: true
      });
    } else {
      this.setState({
        loadComment: !this.state.loadComment,
        showComments: false,
        commentsDisplayed: false
      });
    }
  };

  render() {
    const postData = this.props.postData;
    const user = this.props.user;
    return (
      <Fragment>
        {postData.author.userID === user.userID || user.admin ? (
          <Row className="updateDeletePostButtonsContainer">
            <Col sm={10} />
            <Col sm={2}>
              <span>
                <span>
                  <span
                    className="updatePostIcon"
                    onClick={() => {
                      return this.props.handlePostUpdate(postData.postID);
                    }}>
                    <u>Edit</u>
                  </span>
                </span>
                <span>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span>
                <span
                  className="deletePostIcon"
                  onClick={() => this.props.handlePostDelete(postData.postID)}>
                  <u>Delete</u>
                </span>
              </span>
            </Col>
          </Row>
        ) : null}

        {postData.imageSource ? (
          <Row>
            <Col sm={12} className="postImage">
              <img src={postData.imageSource} alt={postData.postID} />
            </Col>
          </Row>
        ) : (
          ""
        )}
        <Row>
          <Col sm={8}>
            <p className="feedTags">
              <i className="fa fa-sm fa-tag" aria-hidden="true" />
              &nbsp;&nbsp;&nbsp;
              {/* if the post has more than one tag/interest */}
              <span className="individualFeedTags">
                {postData.interests.map(interest => interest.name).join(" / ")}
              </span>
            </p>
          </Col>
          <Col sm={3} className="feedLocationIcon">
            <p className="feedLocation">
              <i className="fa fa-map-marker" aria-hidden="true" />
              &nbsp;&nbsp;&nbsp;
              {postData.location}
            </p>
          </Col>
          <Col sm={1} className="feedCreatedAt">
            <p>
              <i className="fa fa-clock-o" aria-hidden="true" />&nbsp;&nbsp;{postData.createdAtSince.toUpperCase()}
            </p>
          </Col>
        </Row>

        <Row>
          <Col sm={12}>
            <p className="feedPostType">
              {postData.postType}&nbsp;&nbsp;&#65306;
            </p>
          </Col>
        </Row>
        <Row className="feedContent">
          <Col sm={1} />
          <Col sm={10}>
            <p>{postData.content}</p>
          </Col>
          <Col sm={1} />
        </Row>
        {postData.url ? (
          <Row>
            <Col sm={1} />
            <Col sm={3} className="feedUrl">
              <a href={postData.url}>Read More ...</a>
            </Col>
          </Row>
        ) : (
          ""
        )}
        <Row>
          <Col sm={1} />
          <Col sm={1} className="feedPhoto">
            <img
              className="img-fluid"
              src={postData.author.imageSource}
              alt="profile"
            />
          </Col>
          <Col sm={4} className="feedAuthor">
            <p>
              {//temporary as we have data in the db that doesn't have organisationName
              postData.author.organisationName
                ? postData.author.organisationName
                : postData.author.username}
            </p>
          </Col>
        </Row>
        <Row className="separatorHr">
          <Col sm={1} />
          <Col sm={10}>
            <hr />
          </Col>
          <Col sm={1} />
        </Row>
        <Row>
          <Col sm={3} />
          <Col sm={3}>
            <a href={`#${postData.postID}`} className="sharePost">
              <i className="fa fa-share" aria-hidden="true" />&nbsp;&nbsp;Share
            </a>
          </Col>
          <Col sm={3} className="commentIcon">
            <a href={`#${postData.postID}`}>
              <i className="commentNow fa fa-comment" aria-hidden="true" />&nbsp;&nbsp;Comment
            </a>
          </Col>
        </Row>
        <Row className="comments">
          <Col sm={12}>
            <DisplayComment
              feedData={this.props.postData}
              user={this.props.user}
              comments={this.props.postData.comments}
              newComment={this.props.newComment}
              handleChange={this.props.handleChange}
              handleKeyUp={this.props.handleKeyUp}
              showComments={this.state.showComments}
              toggleComment={this.state.toggleComment}
            />
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default DisplayPost;
