import UX from '../../../src/screens/task/ux';
import External from '../../../src/screens/task/external';
import { Factory, C, TestRouter, TimeMock } from '../../helpers';

describe('Tasks External URL Screen', () => {
  let props;

  TimeMock.setTo('2017-10-14T12:00:00.000Z');

  beforeEach(() => {
    const task = Factory.studentTask({ stepCount: 1, type: 'external' });
    props = {
      ux: new UX({ task, router: new TestRouter(), course: Factory.course() }),
    };
  });

  it('matches snapshot', () => {
    expect(<C><External {...props} /></C>).toMatchSnapshot();
  });

  it('renders link with href', () => {
    const ex = mount(<C><External {...props} /></C>);
    expect(ex).toHaveRendered(`a[href="${props.ux.steps[0].external_url}"]`);
    ex.unmount();
  });

});
