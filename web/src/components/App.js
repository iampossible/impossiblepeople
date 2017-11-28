import React, { Component } from "react";
import { Switch, Route, Redirect, BrowserRouter as Router } from "react-router-dom";
import LandingPage from "./views/LandingPage";
import Interest from "./views/Interest";
import Feed from "./views/Feed";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import { Container } from "reactstrap";
import Header from "./views/Header";
import UpdateInterest from "./views/UpdateInterest";

const Main = (props) => {
  console.log(props);
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
};

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
      .then(response => {console.log(response); return response.json()})
      .then(response => {
        let user = response.user || {};
        console.log(user);
        this.setState({user});
        this.forceUpdate();
      })
  }

  setUser = (user) => {
    this.setState({user});
  };

  render() {
    return (
      <Container className="App">
        <Header user={this.state.user} />
        <Main user={this.state.user} setUser={this.setUser} />
      </Container>
    );
  }
}

export default App;
