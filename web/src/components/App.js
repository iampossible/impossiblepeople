import React, { Component } from "react";
import {
  Switch,
  Route,
  withRouter,
  BrowserRouter as Router
} from "react-router-dom";
import LandingPage from "./views/LandingPage";
import BuildOrgProfile from "./views/BuildOrgProfile";
import BuildIndividualsProfile from "./views/BuildIndividualsProfile";
import Feed from "../containers/Feed";
import "bootstrap/dist/css/bootstrap.css";
import "../assets/flatUI-css/flat-ui.css";
import "./App.css";
import { Row, Col } from "reactstrap";
import Header from "./views/Header";
import Footer from "./views/Footer";
import UpdateInterest from "./views/UpdateInterest";
import AdminDashBoard from "./views/AdminDashBoard";
import UserAgreement from "./views/UserAgreement";
import PrivacyPolicy from "./views/PrivacyPolicy";
import Faq from "./views/Faq";
import Feedback from "./views/Feedback";
import MobileLandingPage from "./views/MobileLandingPage"

const Main = props => {
  return (
    <Switch>
      <Route
        exact
        path="/"
        render={routeProps => (
          <LandingPage
            {...routeProps}
            setUser={props.setUser}
            login={props.login}
            register={props.register}
            toggleDisplayForm={props.toggleDisplayForm}
          />
        )}
      />
      <Route
        path="/profile"
        render={routeProps =>
          props.user.userType === "organisation" ? (
            <BuildOrgProfile
              {...routeProps}
              user={props.user}
              setUser={props.setUser}
              getUser={props.getUser}
            />
          ) : (
            <BuildIndividualsProfile
              {...routeProps}
              user={props.user}
              setUser={props.setUser}
              getUser={props.getUser}
            />
          )
        }
      />
      <Route
        path="/feed"
        render={routeProps => <Feed {...routeProps} user={props.user} />}
      />
      <Route
        path="/updateInterest"
        render={routeProps => (
          <UpdateInterest
            {...routeProps}
            user={props.user}
            setUser={props.setUser}
          />
        )}
      />
      <Route
        path="/admin"
        render={routeProps => (
          <AdminDashBoard
            {...routeProps}
            user={props.user}
            setUser={props.setUser}
            getUser={props.getUser}
          />
        )}
      />
      <Route path="/userAgreement" render={() => <UserAgreement />} />
      <Route path="/privacyPolicy" render={() => <PrivacyPolicy />} />
      <Route path="/faq" render={() => <Faq />} />
      <Route path="/feedback" render={() => <Feedback />} />
    </Switch>
  );
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      //to whether display login form or not
      login: false,
      //to whether display registration form or not
      register: false
    };
  }

  async componentWillMount() {
    this.getUser().then(user => {
      this.setState({ user });
    });
  }

  toggleDisplayForm = e => {
    if (e.target.textContent.trim() !== "Sign in") {
      this.setState({
        register: true,
        login: !this.state.login
      });
    } else {
      this.setState({
        register: false,
        login: !this.state.login
      });
    }
  };
  getUser = () => {
    return fetch("/api/user/get", {
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
        return user;
      });
  };
  setUser = user => {
    this.setState({ user });
  };
  render() {
    return (
      <Router>
        <div className="App">
          <Row className="App-header">
            <Col xs={12}>
              <header>
                <Header
                  user={this.state.user}
                  toggleDisplayForm={this.toggleDisplayForm}
                />
              </header>
            </Col>
          </Row>
          <Row className="App-main">
            <Col xs={12}>
              <Main
                user={this.state.user}
                setUser={this.setUser}
                getUser={this.getUser}
                location={this.props.location}
                register={this.state.register}
                login={this.state.login}
                toggleDisplayForm={this.toggleDisplayForm}
              />
            </Col>
          </Row>
            <MobileLandingPage  />
          <Row className="App-footer">
            <Footer />
          </Row>
        </div>
      </Router>
    );
  }
}

export default withRouter(App);
