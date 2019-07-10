import { C } from '../../helpers';
import Factory, { FactoryBot } from '../../factories';
import Courses from '../../../src/models/courses-map';
import Breadcrumbs from '../../../src/components/task-teacher-review/breadcrumbs';
import Router from '../../../src/helpers/router';

jest.mock('../../../src/helpers/router');

describe('Task Teacher Review: Breadcrumbs', function() {
  let plan;
  let course;
  let props;

  beforeEach(() => {
    course = Factory.course();
    Courses.set(course.id, course);
    plan = course.teacherTaskPlans.withPlanId(1);
    plan.update(FactoryBot.create('TeacherDashboardTask'));
    plan.analytics.onApiRequestComplete({
      data: FactoryBot.create('TaskPlanStat', { course }),
    });
    Router.makePathname.mockReturnValue('/bread');
    props = {
      taskPlan: plan,
      scrollToStep: jest.fn(),
      stats: plan.analytics.stats[0],
      title: 'Title',
      courseId: '1',
      unDocked: true,
    };
  });

  it('renders and matches snapshot', () => {
    expect.snapshot(
      <C><Breadcrumbs {...props} /></C>
    ).toMatchSnapshot();
  });

  it('attempts to scroll when click', function() {
    const bc = mount(<C><Breadcrumbs {...props} /></C>);
    bc.find('Breadcrumb').first().simulate('click');
    expect(props.scrollToStep).toHaveBeenCalled();
  });

});
