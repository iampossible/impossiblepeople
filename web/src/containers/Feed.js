import React, { Component, Fragment } from "react";
import { Row, Col, Button } from "reactstrap";
import { RingLoader } from "react-spinners";
import Post from "../components/Post";
import DisplayPost from "../components/DisplayPost";
import FilterButtons from "../components/FilterButtons";

const NoFeedMessage = props => (
  <div id="noFeedMessageContainer">
    <Row>
      <Col xs={1} />
      <Col xs={10} id="noFeedMessage">
        <p>
          <i className="fa fa-lg fa-info-circle" aria-hidden="true" />&nbsp;&nbsp;
          <span>
            Sorry, There is no feed to display, at the moment {props.message}
          </span>
        </p>
      </Col>
      <Col xs={1} />
    </Row>
  </div>
);

class Feed extends Component {
  state = {
    feed: [],
    loading: true,
    loadLastComments: [],
    postToUpdate: "",
    currentFilter: "MOSTRECENT",
    filterTag: "",
    tagsDropdownOpen: false,
    newComment: "",
    commentsDisplayed: false,
    createPostClicked: false
  };

  componentWillMount() {
    this.getFeeds();
    this.setState({
      loadComment: false
    });
    this.forceUpdate();
  }

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
        let feedDataClone = this.state.feed;
        feedDataClone.map(feedData => {
          if (postID === feedData.postID) {
            feedData.comments = resp.comments;
            feedData.commentCount = resp.comments.length;
            this.setState({
              feed: feedDataClone
            });
            this.forceUpdate();
          }
        });
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
        response.map(post => {
          if (post.commentCount > 0) {
            this.getComments(post.postID);
          }
        });
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
    this.setState({ postToUpdate }, () => {
      this.loadPost();
    });
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

  updateFilter = (buttonClicked, tag) => {
    if (buttonClicked === "TAGS") {
      if (tag) {
        this.setState({ filterTag: tag });
      } else {
        this.setState({ filterTag: "" });
      }
    } else {
      this.setState({ currentFilter: buttonClicked });
    }
  };

  toggleTagsDropdown = () => {
    this.setState({
      tagsDropdownOpen: !this.state.tagsDropdownOpen
    });
  };

  handleChange = event => {
    // input is the Comment
    this.setState({ newComment: event.target.value });
  };

  handleKeyUp = (e, postID) => {
    const keyCode = e.keyCode;
    //detecting enter key
    if (keyCode === 13) {
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
      this.setState(
        {
          newComment: ""
        },
        () => {
          this.forceUpdate();
        }
      );
    }
  };

  loadPost = () => {
    window.scrollTo(0, 0);
    this.setState({
      createPostClicked: !this.state.createPostClicked
    });
  };

  render() {
    let counter = 0; // to track number of filtered results based on tag
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
      <Fragment>
        <Row id="feedSection">
          <Col sm={2}>
            <FilterButtons
              interests={user.interests}
              currentFilter={this.state.currentFilter}
              filterTag={this.state.filterTag}
              tagsDropdownOpen={this.state.tagsDropdownOpen}
              toggleTagsDropdown={this.toggleTagsDropdown}
              updateFilter={this.updateFilter}
            />
          </Col>
          {this.state.feed.length > 0 ? (
            <Col sm={8}>
              {this.state.feed.map((feedData, i) => {
                if (
                  (this.state.currentFilter === "ASKS" ||
                    this.state.currentFilter === "OFFERS") &&
                  feedData.postType !== this.state.currentFilter
                ) {
                  counter++;
                  if (counter > this.state.feed.length - 1) {
                    //if there is no feed related to the selected tag
                    return (
                      <NoFeedMessage
                        key={i}
                        message=", which is related to the tag you have selected"
                      />
                    );
                  } else {
                    return null;
                  }
                }
                if (
                  this.state.filterTag &&
                  !feedData.interests.reduce((acc, interest) => {
                    return acc || interest.interestID === this.state.filterTag;
                  }, false)
                ) {
                  counter++;
                  if (counter > this.state.feed.length - 1) {
                    //if there is no feed related to the selected tag
                    return (
                      <NoFeedMessage
                        key={i}
                        message=", which is related to the tag you have selected"
                      />
                    );
                  } else {
                    return null;
                  }
                }

                return (
                  <div key={feedData.postID} className="feed">
                    <DisplayPost
                      postData={feedData}
                      user={user}
                      handlePostUpdate={this.handlePostUpdate}
                      handlePostDelete={this.handlePostDelete}
                      newComment={this.state.newComment}
                      handleChange={this.handleChange}
                      handleKeyUp={this.handleKeyUp}
                    />
                  </div>
                );
              })}
            </Col>
          ) : (
            <Col sm={8}>
              <NoFeedMessage message="." />
            </Col>
          )}

          {/* if user is an organisation display the post component at the top */}
          {(user && (user.userType === "organisation" && user.approved)) ||
          user.admin ? (
            <Col sm={2} id="createPostButton">
              <Button
                className="btn btn-primary btn btn-secondary postBtn"
                onClick={this.loadPost}>
                <i className="fa fa-plus-circle" aria-hidden="true" />&nbsp;&nbsp;
                Create a new post
              </Button>
            </Col>
          ) : (
            ""
          )}
          {this.state.createPostClicked ? (
            <Post
              loadingPost={this.loadPost}
              user={user}
              updateFeeds={this.getFeeds}
              postToUpdate={this.state.postToUpdate}
            />
          ) : (
            ""
          )}
        </Row>
      </Fragment>
    );
  }
}
export default Feed;
