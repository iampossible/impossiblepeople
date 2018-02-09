import React, { Component } from "react";
import { Row, Col, ListGroup, ListGroupItem } from "reactstrap";
import { CSSTransitionGroup } from "react-transition-group";

export default class DisplayComment extends Component {
  render() {
    const TRANSITION_ENTER_TIMEOUT = 500,
      TRANSITION_LEAVE_TIMEOUT = 300;

    return (
      <CSSTransitionGroup
        transitionName="fadeCommentContainer"
        transitionAppear={true}
        transitionAppearTimeout={3000}
        transitionEnter={false}
        transitionLeave={false}>
        <Row className="commentsList">
          <Col xs={12}>
            <ListGroup className="list-inline">
              <CSSTransitionGroup
                transitionName="fadeCommentList"
                transitionEnterTimeout={TRANSITION_ENTER_TIMEOUT}
                transitionLeaveTimeout={TRANSITION_LEAVE_TIMEOUT}>
                {/* showing comments and the author of the comments and their pic  */}
                {/* number of comments that should be desplayed needs to have limited size - 8
                    since the last comment is displayed at the end we need to display that one
                  */}
                {this.props.comments.length > 0
                  ? this.props.comments.map((comment, i) => {
                      if (
                        this.props.comments.length < 8 ||
                        (i >= this.props.comments.length - 8 &&
                          i < this.props.comments.length)
                      ) {
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
                              <Col sm={10} className="commentContentContainer">
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
      </CSSTransitionGroup>
    );
  }
}
