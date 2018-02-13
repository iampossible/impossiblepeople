import React, { Component } from "react";
import { Row, Col } from "reactstrap";

export default class Faq extends Component {
  render() {
    return (
      <Row className="footerLinks">
        <Col sm={12}>
          <Row>
            <Col sm={1} />
            <Col sm={10}>
              <h3>
                <u>Frequently Asked Questions</u>
              </h3>
            </Col>
            <Col sm={1} />
          </Row>
          <Row>
            <Col sm={1} />
            <Col sm={10}>
              <h5>How’s it different from other social networks?</h5>
              <p>
                <strong>HumanKind</strong> is entirely non profit. It designed
                for the refugee support sector by the refugee support sector. It
                is a dedicated platform for communicating and sharing skills and
                resources. It will always encourage a free exchange of goods,
                services and peer support. We don&#39;t pass your data on and we
                don&#39;t share your private details with anyone.
              </p>
            </Col>
            <Col sm={1} />
          </Row>
          <Row>
            <Col sm={1} />
            <Col sm={10}>
              <h5>Why wouldn’t I just use a Facebook group?</h5>
              <p>
                We are optimised for matching posts between skilled individuals
                and the groups that need their support, so instead of a lot of
                noise, we will make sure you see the requests that are targeted
                for you on this specific subject only and based on location,
                skills and interest.
              </p>
            </Col>
            <Col sm={1} />
          </Row>
          <Row>
            <Col sm={1} />
            <Col sm={10}>
              <h5>Who sees what?</h5>
              <p>
                Our matching algorithm makes sure your post is shown to
                individuals and other Groups nearby you, or who are interested
                in that topic or have matching skills .When you comment on a
                post, the post creator will receive an email notification and
                other users will also see your comment and they can comment
                below.
              </p>
            </Col>
            <Col sm={1} />
          </Row>
          <Row>
            <Col sm={1} />
            <Col sm={10}>
              <h5>Why can’t individuals post to the app?</h5>
              <p>
                At the moment the platform is restricted so that only verified
                organisations can post their needs and individual users can then
                assist them by offering their skills and services . This policy
                may be reviewed at a later date to allow individuals to post
                also .
              </p>
            </Col>
            <Col sm={1} />
          </Row>
          <Row>
            <Col sm={1} />
            <Col sm={10}>
              <h5>Who is it for?</h5>
              <p>
                Trusted non profit groups that want to share their skills and
                develop a stronger sense of community. Individuals who want to
                lend their skills and time to help others. Companies who want to
                partner with charities to create opportunities for Refugees and
                Asylum seekers.
              </p>
            </Col>
            <Col sm={1} />
          </Row>
          <Row>
            <Col sm={1} />
            <Col sm={10}>
              <h5>
                What kinds of services do our category definitions include ?
              </h5>
              <p>
                <strong>Welfare</strong> &ndash; Food ,Social work, housing and
                benefits advice, In&#45;kind donations, distribution of goods
                and general support.
              </p>
              <p>
                <strong> Projects</strong> &ndash; Short term or ongoing
                activities and opportunities and workshops.
              </p>
              <p>
                <strong>Fundraising</strong> &ndash; fundraising events,
                fundraising campaigns, participatory fundraising activities
              </p>
              <p>
                <strong>Community</strong> &ndash; Social,Recreation, Events,
                Faith, Befriending
              </p>
              <p>
                <strong>Women&apos;s Services</strong> Activities and services
                for women only.
              </p>
              <p>
                <strong>Education</strong> &ndash; Adult Education, Mentoring,
                Skills sharing, Training, Employment, Buddying, Language
                Classes.
              </p>
              <p>
                <strong>Advocacy</strong> &ndash; Campaigning, Lobbying,
                Petitioning, Calls to Action, Activism
              </p>
              <p>
                Children &#43; Youth &ndash; Activities and services for
                Children and young people ( under 18) such as, Play focussed,
                sports, arts, media, drama, music etc.
              </p>
              <p>
                <strong>Heath and Wellbeing</strong> &ndash; holistic,
                therapeutic, yoga, fitness, counselling, mental health support.
              </p>
              <p>
                <strong>Other</strong> &ndash; anything we haven&#39;t thought
                of.
              </p>
            </Col>
            <Col sm={1} />
          </Row>
        </Col>
      </Row>
    );
  }
}
