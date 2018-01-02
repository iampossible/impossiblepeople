import React, { Component } from "react";
import {
  Switch,
  Route,
  Redirect,
  withRouter,
  BrowserRouter as Router
} from "react-router-dom";
import LandingPage from "./views/LandingPage";
import Interest from "./views/Interest";
import Feed from "./views/Feed";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import { Container, Row, Col } from "reactstrap";
import Header from "./views/Header";
import Footer from "./views/Footer";
import UpdateInterest from "./views/UpdateInterest";

const Main = props => {
  return (
    <Switch>
      <Route
        exact
        path="/"
        render={routeProps => (
          <LandingPage {...routeProps} setUser={props.setUser} />
        )}
      />
      <Route
        path="/interest"
        render={routeProps => (
          <Interest {...routeProps} user={props.user} setUser={props.setUser} />
        )}
      />
      <Route
        path="/feed"
        render={routeProps => <Feed {...routeProps} user={props.user} />}
      />
      <Route
        path="/updateInterest"
        render={routeProps => (
          <Interest {...routeProps} user={props.user} setUser={props.setUser} />
        )}
      />
    </Switch>
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
      .then(response => {
        if (response.status > 399) return {};
        return response.json();
      })
      .then(response => {
        let user = response.user || {};
        this.setState({ user });
      });
  }

  setUser = user => {
    this.setState({ user });
  };

  render() {
    return (
      <Router>
        <Container className="App">
          <Row className="App-header">
            <Col xs={12}>
              <Header user={this.state.user} location={this.props.location} />
            </Col>
          </Row>
          <Row className="App-main">
            <Col xs={12}>
              <Main
                user={this.state.user}
                setUser={this.setUser}
                location={this.props.location}
              />
            </Col>
          </Row>
          <Row className="App-footer">
            <Col xs={12}>
              <Footer />
            </Col>
          </Row>
        </Container>
      </Router>
    );
  }
}

export default withRouter(App);
