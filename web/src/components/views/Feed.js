import React, { Component } from "react";
import { Row, Col, Button, Tooltip } from "reactstrap";
import { Comment } from "./Comment";
import Post from "./Post";
import { RingLoader } from "react-spinners";
import "bootstrap/dist/css/bootstrap.css";
import * as moment from "moment";

class Feed extends Component {
  state = {
    feed: [],
    loading: true,
    loadLastComments: [],
    updateTooltipOpen: false,
    deleteTooltipOpen: false,
    postToUpdate: ""
  };

  componentWillMount() {
    this.getFeeds();
  }
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
  getFeeds = () => {
    this.setState({
      postToUpdate: ""
    });
    //this will load the feed to the page and then will load all the comments for each post
    fetch("/api/feed", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    })
      .then(response => {
        if (response.status === 401) this.props.history.push("/");
        if (response.status > 399) return [];
        return response.json();
      })
      .then(response => {
        /* because the current impelementation of the api returns a post as an independent pos
          with each interest/tag. we have to group the interests in the category and remove the duplicated 
          interests   */
        for (let i = 0; i < response.length - 1; i++) {
          for (let j = i + 1; j < response.length; j++) {
            if (response[i] && response[j]) {
              if (response[i].postID === response[j].postID) {
                response[i].category.push(response[j].category[0]);
                delete response[j];
              }
            }
          }
        }
        /* since the delete response[j] command will not make the deleted array entry to have
           'undefined' value we have to filter that out. 
           Array.slice() will not work as it immediately reshuffles the array our condition will fill for 
           consecuative true values as the next one will not be checked as it took the position of the 
           deleted entry
          */
        response = response.filter(response => response !== undefined);
        return response;
      })
      .then(response => {
        this.setState({
          feed: response,
          loadLastComments: [],
          loading: false
        });
      });
  };
  handlePostUpdate = postID => {
    let postToUpdate = this.state.feed.filter(
      feedData => feedData.postID === postID
    );
    this.setState({ postToUpdate });
  };
  handlePostDelete = postID => {
    if (window.confirm("Do you really want to delete this post ?")) {
      fetch(`/api/post/${postID}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        credentials: "same-origin"
      })
        .then(resp => {
          if (resp.status > 399) return [];
          return resp.json();
        })
        .then(resp => {
          if (resp !== []) {
            this.getFeeds();
          }
        });
    }
  };

  render() {
    //getting the user type that is passed from the App redirect
    const { user } = this.props;
    return this.state.loading ? (
      <Row id="feedRingLoader">
        <Col xs={4} />
        <Col xs={4}>
          <div className="RingLoader center-loading">
            <RingLoader
              color="#123abc"
              loading={this.state.loading}
              size={100} /*the size of the spinner*/
            />
          </div>
        </Col>
        <Col xs={4} />
      </Row>
    ) : (
      <div>
        {/* if user is an organisation display the post component at the top */}
        {user && user.userType === "organisation" ? (
          <Post
            user={user}
            updateFeeds={this.getFeeds}
            postToUpdate={this.state.postToUpdate}
          />
        ) : (
          ""
        )}
        {this.state.feed.length > 0 ? (
          this.state.feed.map((feedData, i) => {
            return (
              <div key={feedData.postID} className="feed">
                <Row xs={12}>
                  <Col sm={3} xs={12}>
                    <Row className="feedPhoto">
                      <img
                        className="img-fluid feedPhoto"
                        src={
                          feedData.author.imageSource ||
                          "../assets/images/profile-icon.png"
                        }
                        alt="profile"
                      />
                      <blockquote className="blockquote">
                        <footer className="blockquote-footer">
                          <span className="feedAuthor">
                            <i
                              className="fa fa-sm fa-chevron-right"
                              aria-hidden="true"
                            />
                            &nbsp;
                            {feedData.author.username}
                          </span>&nbsp;
                        </footer>
                      </blockquote>
                    </Row>
                  </Col>
                  <Col className="feedBody" sm={9} xs={12}>
                    <Row>
                      <Col xs={12}>
                        {feedData.author.userID === user.userID ? (
                          <Row xs={12}>
                            <Col xs={10} />
                            <Col
                              xs={2}
                              className="updateDeletePostButtonsContainer"
                            >
                              <a
                                id="ToolTipUpdateIcon"
                                className="updatePostIcon"
                                href="#post"
                                onClick={() =>
                                  this.handlePostUpdate(feedData.postID)
                                }
                              >
                                <i className="material-icons">edit</i>
                              </a>
                              <Tooltip
                                placement="left"
                                isOpen={this.state.updateTooltipOpen}
                                target="ToolTipUpdateIcon"
                                toggle={this.toggleUpdatePost}
                              >
                                Update Post
                              </Tooltip>
                              <a
                                id="TooltipDeleteIcon"
                                className="deletePostIcon"
                                onClick={() =>
                                  this.handlePostDelete(feedData.postID)
                                }
                              >
                                <i className="material-icons">clear</i>
                              </a>
                              <Tooltip
                                placement="right"
                                isOpen={this.state.deleteTooltipOpen}
                                target="TooltipDeleteIcon"
                                toggle={this.toggleDeletePost}
                              >
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
                          <p className="feedContent">{feedData.content}</p>
                          <footer className="blockquote-footer">
                            <cite title="Source Title">
                              <Row>
                                <Col xs={1} className="feedTagsIcon">
                                  <span>
                                    <i
                                      className="fa fa-sm fa-tag"
                                      aria-hidden="true"
                                    />
                                  </span>
                                </Col>
                                <Col xs={11}>
                                  <p className="feedTags">
                                    {/* if the post has more than one tag/interest */}
                                    <span>
                                      {feedData.category.map((interest, i) => {
                                        let tag = "";
                                        if (i === 0) {
                                          tag = interest.name;
                                        } else {
                                          tag += " / " + interest.name;
                                        }
                                        return tag;
                                      })}
                                    </span>
                                  </p>
                                </Col>
                                <Col xs={1} className="feedLocationIcon">
                                  <span>
                                    <i
                                      className="fa fa-map-marker"
                                      aria-hidden="true"
                                    />
                                  </span>
                                </Col>
                                <Col xs={11}>
                                  <p className="feedLocation">
                                    {feedData.location}
                                  </p>
                                </Col>
                                <Col xs={1} className="feedCreatedAtIcon">
                                  <span>
                                    <i className="fa fa-calendar" />
                                  </span>
                                </Col>
                                <Col xs={11}>
                                  <p className="feedCreatedAt">
                                    {moment(feedData.createdAt).format(
                                      "MMM Do, YYYY"
                                    )}&nbsp;
                                  </p>
                                </Col>
                              </Row>
                            </cite>
                          </footer>
                        </blockquote>
                      </Col>
                    </Row>
                    <Row id="comments">
                      <Col xs={12}>
                        <Comment postID={feedData.postID} user={user} />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            );
          })
        ) : (
          <div id="noFeedMessageContainer">
            <Row>
              <Col xs={1} />
              <Col xs={10} id="noFeedMessage">
                <p>
                  <i className="fa fa-lg fa-info-circle" aria-hidden="true" />&nbsp;&nbsp;
                  <span>
                    Sorry, There is no feed to display, at the moment, which is
                    related to the interest areas that you have subscribed for.
                  </span>
                </p>
              </Col>
              <Col xs={1} />
            </Row>
          </div>
        )}
      </div>
    );
  }
}
export default Feed;
