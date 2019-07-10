import { Factory, FakeWindow, ld } from '../../../helpers';
import { TaskStep } from '../../../../src/screens/task/step';

describe('Tasks Steps', () => {
  let props;

  beforeEach(() => {
    const step = Factory.studentTask({ type: 'homework', stepCount: 1 }).steps[0];
    const ux = {
      viewedInfoSteps: [],
      course: Factory.course(),
      onAnswerChange: jest.fn(),
      canGoForward: true,
      goForward: jest.fn(),
      currentStep: step,
    };
    props = { ux, step, windowImpl: new FakeWindow };
  });

  it('renders loading', () => {
    props.step.isFetched = false;
    expect(props.step.needsFetched).toBeTruthy();
    const s = mount(<TaskStep {...props} />);
    expect(s).toHaveRendered('ContentLoader');
    s.unmount();
  });

  it('renders info cards', () => {
    ld.forEach({
      'two-step-intro': 'TwoStepValueProp',
      'personalized-intro': 'PersonalizedGroup',
      'spaced-practice-intro': 'SpacedPractice',
      'individual-review-intro': 'IndividualReview',
    }, (component, type) => {
      props.step = { type };
      const ts = mount(<TaskStep {...props} />);
      expect(ts).toHaveRendered(component);
      ts.unmount();
    });
  });

});
