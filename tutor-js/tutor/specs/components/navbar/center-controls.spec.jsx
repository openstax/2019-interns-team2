import { EnzymeContext, TimeMock, Factory } from '../../helpers';
import CenterControls from '../../../src/components/navbar/center-controls';

describe('Center Controls', function() {
  let props;

  TimeMock.setTo('2017-10-14T12:00:00.000Z');

  beforeEach(() => {
    props = {
      course: Factory.course(),
    };
  });

  afterEach(() => {
    CenterControls.currentTaskStep = null;
  });

  it('hides itself by default', () => {
    const cntrl = mount(<CenterControls {...props} />, EnzymeContext.build());
    expect(cntrl.html()).toBeNull();
    cntrl.unmount();
  });

  it('renders milestones link when task is set', () => {
    CenterControls.currentTaskStep = Factory.studentTask({ type: 'reading', stepCount: 1 }).steps[0];
    const cntrl = mount(<CenterControls {...props} />, EnzymeContext.build());
    expect(cntrl).toHaveRendered('MilestonesToggle');
    cntrl.unmount();
  });

  it('hides notes when not annotatable', () => {
    const step = Factory.studentTask({ type: 'reading', stepCount: 1 }).steps[0];
    step.type = 'reading';
    expect(step.canAnnotate).toBe(true);
    CenterControls.currentTaskStep = step;
    const cntrl = mount(<CenterControls {...props} />, EnzymeContext.build());
    expect(cntrl.find('NoteSummaryToggle').html()).not.toBeNull();
    step.type = 'exercise';
    expect(cntrl.find('NoteSummaryToggle').html()).toBeNull();
    cntrl.unmount();
  });

});
