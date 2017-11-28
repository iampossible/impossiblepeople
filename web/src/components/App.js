import React, { Component } from "react";
import { Switch, Route, Redirect, withRouter, BrowserRouter as Router } from "react-router-dom";
import LandingPage from "./views/LandingPage";
import Interest from "./views/Interest";
import Feed from "./views/Feed";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import { Container } from "reactstrap";
import Header from "./views/Header";
import UpdateInterest from "./views/UpdateInterest";

const Main =  withRouter ((props) => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" render={(routeProps) =>  {
          return (!props.user.hasOwnProperty('userID')) ? (
              <LandingPage {...routeProps} setUser={props.setUser} />
            ) : (
              <Redirect to="/feed" />
            )
        }} />
        <Route path="/interest" render={(routeProps) =>  <Interest {...routeProps} user={props.user} setUser={props.setUser} />} />
        <Route path="/feed" render={(routeProps) =>  <Feed {...routeProps} user={props.user} />} />
        <Route path="/updateInterest" component={UpdateInterest} user={props.user} />
      </Switch>
    </Router>
  );
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    };
  }

  componentDidMount() {
    fetch("/api/user/get", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    })
      .then(response => response.json())
      .then(response => {
        let user = response.user || {};
        this.setState({user});
      })
  }

  setUser = (user) => {
    this.setState({user});
  };

  render() {
    return (
      <Container className="App">
        <Header user={this.state.user} location={this.props.location} />
        <Main user={this.state.user} setUser={this.setUser} />
      </Container>
    );
  }
}

export default withRouter(App);
