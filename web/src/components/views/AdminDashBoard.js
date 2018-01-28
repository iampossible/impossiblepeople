import React, { Component, Fragment } from "react";
import {
  Col,
  Row,
  Button,
  Label,
  Input,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.css";

export default class AdminDashboard extends Component {
  state = {
    listOfEmailsNeedsApproval: [],
    listOfEmailsApproved: new Set(),
    disableDropdownAndApproveButton: ""
  };

  componentWillMount() {
    this.getNotApprovedOrgs();
  }
  getNotApprovedOrgs = () => {
    fetch("/api/user/getNotApprovedOrgs", {
      credentials: "same-origin",
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    })
      .then(response => {
        if (response.status > 399) {
          throw new Error("Can't handle your request");
        }
        return response.json();
      })
      .then(response => {
        response[0].length >= 1
          ? this.setState({
              listOfEmailsNeedsApproval: new Set(response[0]),
              disableDropdownAndApproveButton: false
            })
          : this.setState({
              disableDropdownAndApproveButton: true
            });
      })
      .catch(err => console.log("Error: " + err.message));
  };
  handleSelect = targetEmail => {
    const listOfEmailsApproved = new Set(this.state.listOfEmailsApproved);
    if (!listOfEmailsApproved.has(targetEmail)) {
      listOfEmailsApproved.add(targetEmail);
    } else {
      listOfEmailsApproved.delete(targetEmail);
    }
    this.setState({ listOfEmailsApproved });
  };
  handleSelectAll = () => {
    this.setState({
      listOfEmailsApproved: this.state.listOfEmailsNeedsApproval
    });
  };

  handleChangeStatusSubmit = () => {
    let x = JSON.stringify({
      organisationsEmailList: [...this.state.listOfEmailsApproved]
    });

    fetch("/api/user/updateOrganisationStatus", {
      credentials: "same-origin",
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(x)
    })
      .then(response => {
        if (!response && response.status > 399)
          throw new Error("Can't handle your request");
        return response.json();
      })
      .then(response => {
        if (response) this.getNotApprovedOrgs();
      })
      .catch(err => console.log("Error: " + err.message));
  };
  render() {
    let listOfEmailsNeedsApproval = [...this.state.listOfEmailsNeedsApproval];
    return (
      <Fragment>
        <Row id="listOfEmailsForApprovalContainer">
          <Col sm={3} />
          <Col xs="12" sm={4}>
            <UncontrolledButtonDropdown>
              <DropdownToggle
                caret
                outline
                color="info"
                //to avoid Warning: Failed prop type: Invalid prop `disabled` of
                //type `string` supplied to `Button`, expected `boolean`
                disabled={Boolean(this.state.disableDropdownAndApproveButton)}>
                &nbsp;Emails that need approval&nbsp;
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={this.handleSelectAll} toggle={false}>
                  Select All
                </DropdownItem>
                <DropdownItem divider />
                {listOfEmailsNeedsApproval &&
                  listOfEmailsNeedsApproval.map((email, index) => {
                    return (
                      //to avoid Warning: Each child in an array or iterator should have a unique "key" prop.
                      <Fragment key={index}>
                        <DropdownItem
                          key={index}
                          tag={Label}
                          for={`email-${index}`}
                          toggle={false}
                          onClick={() => this.handleSelect(email)}>
                          <Input
                            name={`email-${index}`}
                            type="checkbox"
                            value={email}
                            checked={this.state.listOfEmailsApproved.has(email)}
                            style={{ pointerEvents: "none" }}
                            readOnly
                          />
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          {email}
                        </DropdownItem>
                        {index !== listOfEmailsNeedsApproval.length - 1 ? (
                          <DropdownItem divider />
                        ) : null}
                      </Fragment>
                    );
                  })}
              </DropdownMenu>
            </UncontrolledButtonDropdown>
          </Col>
          <Col sm={2}>
            <Button
              color="danger"
              onClick={this.handleChangeStatusSubmit}
              disabled={Boolean(this.state.disableDropdownAndApproveButton)}>
              <i className="fa fa-check" aria-hidden="true" />&nbsp;&nbsp;Approve
            </Button>
          </Col>
          <Col sm={2} />
        </Row>
        <Row id="noEmailForApprovalErrorMessageContainer">
          <Col sm={3} />
          <Col sm={7}>
            {this.state.disableDropdownAndApproveButton ? (
              <p>There is no organisation that needs approval at the moment</p>
            ) : null}
          </Col>
          <Col sm={2} />
        </Row>
      </Fragment>
    );
  }
}
