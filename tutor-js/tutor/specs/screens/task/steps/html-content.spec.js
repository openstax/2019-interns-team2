import HtmlContent from '../../../../src/screens/task/step/html-content';
import { Factory, TestRouter, TimeMock } from '../../../helpers';
import UX from '../../../../src/screens/task/ux';

jest.mock('../../../../../shared/src/components/html', () => ({ html }) =>
  html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null
);

describe('Html Content Tasks Screen', () => {
  let props;
  TimeMock.setTo('2017-10-14T12:00:00.000Z');
  beforeEach(() => {
    const task = Factory.studentTask({ type: 'reading', steps: [{ type: 'interactive' }] });
    const ux = new UX({
      task,
      course: Factory.course(),
      router: new TestRouter(),
    });
    props = {
      ux,
      step: task.steps[0],
    };
  });

  it('matches snapshot', () => {
    expect.snapshot(<HtmlContent {...props} />).toMatchSnapshot();
  });

  it('renders html', () => {
    props.step.content.html = '<p>testing text</p>';
    const ia = mount(<HtmlContent {...props} />);
    expect(ia.text()).toContain('testing text');
    ia.unmount();
  });

});
