import React, { Component } from "react";
import {
  Row,
  Col,
  InputGroup,
  Input,
  Button,
  ListGroup,
  ListGroupItem,
  Badge,
  Container
} from "reactstrap";
import { CSSTransitionGroup } from "react-transition-group";

export default class Comment extends Component {
  state = {
    newComment: "",
    comments: [],
    loadComment: "",
    commentButtonText: "fa fa-angle-double-down",
    commentsDisplayed: false
  };

  componentWillMount = () => {
    this.setState({
      loadComment: false
    });
    this.getComments(this.props.postID);
    this.forceUpdate();
  };

  getComments = postID => {
    fetch(`/api/post/${postID}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    })
      .then(resp => resp.json())
      .then(resp => {
        this.setState({
          comments: resp.comments
        });
        this.forceUpdate();
      });
  };

  handleChange = event => {
    // input is the Comment
    this.setState({ newComment: event.target.value });
  };

  toggleComment = e => {
    let commentsDisplayed = this.state.commentsDisplayed;
    if (!commentsDisplayed) {
      this.setState({
        loadComment: !this.state.loadComment,
        commentButtonText: "fa fa-angle-double-up",
        commentsDisplayed: true
      });
    } else {
      this.setState({
        loadComment: !this.state.loadComment,
        commentButtonText: "fa fa-angle-double-down",
        commentsDisplayed: false
      });
    }
  };

  handleClick(event) {
    //I retriving the postId to write the comment on the database
    let postID = event.target.value;

    // here we have two fetch :first one  is for writing the comment on the database  and the second one will load the posts to retrive the  last comments

    fetch(`/api/post/${postID}/comment`, {
      method: "POST",
      body: JSON.stringify({ content: this.state.newComment }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    }).then(() => {
      this.getComments(postID);
    });
    this.setState({
      newComment: ""
    });
    this.forceUpdate();
  }

  render() {
    const TRANSITION_ENTER_TIMEOUT = 500,
      TRANSITION_LEAVE_TIMEOUT = 300;

    return (
      <Container>
        <Row>
          <Row sm={10} xs={12} className="commentContainer">
            <Col sm={1} xs={1} className="currentUserAvatar">
              <img src={this.props.user.imageSource} alt="current user" />
            </Col>
            <Col sm={8} xs={11} className="newCommentInputContainer">
              <InputGroup>
                <Input
                  style={{ width: "700px", height: "40px" }}
                  type="textarea"
                  className="newComment"
                  placeholder="Interested...let us know via commenting"
                  onChange={this.handleChange}
                  input={this.state.newComment}
                  value={this.state.newComment}
                />
              </InputGroup>
            </Col>
            <Col sm={2} xs={12} className="commentPostButton">
              <Button
                onClick={e => {
                  this.handleClick(e);
                }}
                value={this.props.postID}>
                Comment
              </Button>
            </Col>
          </Row>
          <Col xs={1} />
          <Col xs={3} className="commentButtonContainer">
            {this.state.comments.length > 0 ? (
              <Button
                className="commentShowHideButton"
                onClick={this.toggleComment}>
                <Badge pill>{this.state.comments.length}</Badge>&nbsp;&nbsp;<i
                  className="fa fa-comments"
                  aria-hidden="true"
                />
                &nbsp; &nbsp;<i
                  className={this.state.commentButtonText}
                  aria-hidden="true"
                />
              </Button>
            ) : null}
          </Col>
          <Col xs={8} />
        </Row>

        {this.state.loadComment ? (
          <CSSTransitionGroup
            transitionName="fadeCommentContainer"
            transitionAppear={true}
            transitionAppearTimeout={3000}
            transitionEnter={false}
            transitionLeave={false}>
            <Col>
              <Row className="commentsList">
                <Col xs={12}>
                  <ListGroup className="list-inline">
                    <CSSTransitionGroup
                      transitionName="fadeCommentList"
                      transitionEnterTimeout={TRANSITION_ENTER_TIMEOUT}
                      transitionLeaveTimeout={TRANSITION_LEAVE_TIMEOUT}>
                      {/* showing comments and the author of the comments and their pic  */}
                      {/* number of comments that should be desplayed needs to have limited size - 5
                        since the last comment is displayed at the end we need to display that one
                      */}
                      {this.state.comments.length > 0
                        ? this.state.comments.map((comment, i) => {
                            if (i < 5 || i === this.state.comments.length - 1) {
                              return (
                                <ListGroupItem
                                  className="list-inline-item"
                                  key={comment.commentID}>
                                  <Row>
                                    <Col sm={1} className="commenterAvatar">
                                      <img
                                        src={comment.imageSource}
                                        alt={comment.author}
                                      />
                                    </Col>
                                    <Col
                                      sm={10}
                                      className="commentContentContainer">
                                      <span className="commentAuthor">
                                        {comment.author} :&nbsp;&nbsp;&nbsp;
                                      </span>
                                      <span className="commentContent">
                                        {comment.content.length > 20
                                          ? comment.content
                                          : comment.content}
                                      </span>
                                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                      <span className="commentCreatedAtSince">
                                        <i className="fa fa-clock-o" />&nbsp;{comment.createdAtSince +
                                          " ago"}&nbsp;
                                      </span>
                                      <hr />
                                    </Col>
                                  </Row>
                                </ListGroupItem>
                              );
                            }
                          })
                        : null}
                    </CSSTransitionGroup>
                  </ListGroup>
                </Col>
              </Row>
            </Col>
          </CSSTransitionGroup>
        ) : null}
      </Container>
    );
  }
}
