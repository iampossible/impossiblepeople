import React, { Component } from "react";
import { Row, Col } from "reactstrap";
import { RingLoader } from "react-spinners";
import Comment from "../components/Comment";
import Post from "../components/Post";
import DisplayPost from "../components/displayPost";
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
    tagsDropdownOpen: false
  };

  componentWillMount() {
    this.getFeeds();
  }

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
      .then(response =>
        response.map(post => {
          post.comments = [];
          return post;
        })
      )
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

  toggleTagesDropdown = () => {
    this.setState({
      tagsDropdownOpen: !this.state.tagsDropdownOpen
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
      <div>
        {/* if user is an organisation display the post component at the top */}
        {(user && (user.userType === "organisation" && user.approved)) ||
        user.admin ? (
          <Post
            user={user}
            updateFeeds={this.getFeeds}
            postToUpdate={this.state.postToUpdate}
          />
        ) : (
          ""
        )}
        <FilterButtons
          interests={user.interests}
          currentFilter={this.state.currentFilter}
          filterTag={this.state.filterTag}
          tagsDropdownOpen={this.state.tagsDropdownOpen}
          toggleTagesDropdown={this.toggleTagesDropdown}
          updateFilter={this.updateFilter}
        />
        {this.state.feed.length > 0 ? (
          this.state.feed.map((feedData, i) => {
            if (
              (this.state.currentFilter === "ASKS" ||
                this.state.currentFilter === "OFFERS") &&
              feedData.postType !== this.state.currentFilter
            )
              return null;
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
                <Row xs={12}>
                  <DisplayPost
                    postData={feedData}
                    user={user}
                    handlePostUpdate={this.handlePostUpdate}
                    handlePostDelete={this.handlePostDelete}
                  />
                  <Row id="comments">
                    <Col sm={3} />
                    <Col sm={9}>
                      <Comment postID={feedData.postID} user={user} />
                    </Col>
                  </Row>
                </Row>
              </div>
            );
          })
        ) : (
          <NoFeedMessage message="." />
        )}
      </div>
    );
  }
}
export default Feed;
