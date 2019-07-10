import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { OnboardingNag, Heading, Body, Footer } from './onboarding-nag';
import CourseUX from '../../models/course/ux';
import Courses from '../../models/courses-map';
import TutorRouter from '../../helpers/router';

export default
@observer
class FreeTrialEnded extends React.Component {

  static propTypes = {
    ux: PropTypes.object.isRequired,
    onDismiss: PropTypes.func.isRequired,
  }

  static contextTypes = {
    router: PropTypes.object,
  }

  static className = 'free-trial-ended'

  @action.bound
  goToMyCourses() {
    this.context.router.history.push(TutorRouter.makePathname('myCourses'));
  }

  renderBackLink() {
    if (Courses.size <= 1) { return null; }

    return (
      <Button variant="link" onClick={this.goToMyCourses}>
        Return to my courses
      </Button>
    );
  }

  render() {
    const { ux } = this.props;

    return (
      <OnboardingNag className="free-trial-ended">
        <Heading>
          Your free trial for {ux.course.name} has ended
        </Heading>
        <Body>
          <p>
            To continue accessing your course, click the button below to pay your
            one-time {CourseUX.formattedStudentCost} fee for the semester.
          </p>
        </Body>
        <Footer>
          <Button variant="primary" onClick={ux.payNow}>
            Buy access now
          </Button>
          {this.renderBackLink()}
        </Footer>
      </OnboardingNag>
    );

  }

}
