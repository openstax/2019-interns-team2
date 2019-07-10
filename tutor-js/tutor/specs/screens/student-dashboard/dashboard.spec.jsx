import { React, Router, TimeMock } from '../../helpers';
import Dashboard from '../../../src/screens/student-dashboard/dashboard';
import Factory from '../../factories';
import { bootstrapCoursesList } from '../../courses-test-data';
import Raven from '../../../src/models/app/raven';

jest.mock('../../../src/models/app/raven');

describe('Student Dashboard', () => {
  let props;

  TimeMock.setTo('2015-10-14T12:00:00.000Z');

  beforeEach(() => {
    const course = bootstrapCoursesList().get(1);
    Factory.studentTaskPlans({ course, attributes: { now: new Date('2015-10-21T12:00:00.000Z') } });
    course.studentTaskPlans.fetch = jest.fn();
    props = {
      course,
      params: {},
    };
  });

  it('matches snapshot', () => {
    props.course.studentTaskPlans.all_tasks_are_ready = false;
    props.course.primaryRole.joined_at = new Date('2015-09-14T12:00:00.000Z');
    expect.snapshot(<Router><Dashboard {...props} /></Router>).toMatchSnapshot();
  });

  it('displays as loading', () => {
    props.course.studentTaskPlans.all_tasks_are_ready = false;
    props.course.primaryRole.joined_at = new Date('2015-10-14T12:00:00.000Z');
    const dash = mount(<Router><Dashboard {...props} /></Router>);
    expect(dash).toHaveRendered('ThisWeekCard Card[className="empty pending"]');
    expect.snapshot(<Router><Dashboard {...props} /></Router>).toMatchSnapshot();
  });

  it('fetches on mount', () => {
    const dash = mount(<Router><Dashboard {...props} /></Router>);
    expect(props.course.studentTaskPlans.fetch).toHaveBeenCalled();
    dash.unmount();
  });

  it('logs when BL times out', () => {
    props.course.studentTaskPlans.all_tasks_are_ready = false;
    props.course.primaryRole.joined_at = new Date('2015-10-11T12:00:00.000Z');
    const tp = props.course.studentTaskPlans;
    tp.api.requestCounts.read = 2;
    expect(tp.taskReadinessTimedOut).toBe(true);
    const dash = mount(<Router><Dashboard {...props} /></Router>);
    expect(Raven.log).toHaveBeenCalled();
    dash.unmount();
  });

});
