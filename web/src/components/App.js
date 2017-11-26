import React, { Component } from "react";
import { Switch, Route, Redirect, BrowserRouter as Router } from "react-router-dom";
import LandingPage from "./views/LandingPage";
import Interest from "./views/Interest";
import Feed from "./views/Feed";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";

import { Container, Row, Col, Button } from "reactstrap";

const Header = (props) => {
  console.log(props);
  return (
    <header className="App-header">
      <h1>We Are One</h1>
      {props.but}
    </header>
  );
};

const Main = (props) => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" render={(routeProps) =>  {
          return (props.user.hasOwnProperty('userID')) ? (
              <Redirect to="/feed" />
            ) : (
              <LandingPage {...routeProps} setUser={props.setUser} />
            )
        }} />
        <Route path="/interest" render={(routeProps) =>  <Interest {...routeProps} user={props.user} setUser={props.setUser} />} />
        <Route path="/feed" render={(routeProps) =>  <Feed {...routeProps} user={props.user} />} />
      </Switch>
    </Router>
  );
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: {},
      currentView: 'LandingPage'
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

  logout = e => {
    fetch('/api/auth/logout', {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    })
      .then(response => {
        if (response.status === 200)
          this.props.history.push("/feed" )
      })
  };

  render() {
    return (
      <Container className="App">
        <Row>
          <Col className="col-sm-12 col-md-12">
            <Header
              but={(this.state.user.hasOwnProperty('userID')) ? 
                <Button
                  className=""
                  onClick={e => {
                    this.logout(e);
                  }}
                >
                  Logout
                </Button>
               : <h1>test</h1>} 
            />
          </Col>
        </Row>
        <Main user={this.state.user} setUser={this.setUser}/>
      </Container>
    );
  }
}

export default App;
