import { C } from '../helpers';
import BestPracticesTip from '../../src/components/best-practices-tip';

describe('Course Page', () => {

  let props;

  beforeEach(() => {
    props = {

    };
  });

  it('renders and matches snapshot', () => {
    expect.snapshot(
      <C noRef><BestPracticesTip>
        If you knew better, you’d do betta
      </BestPracticesTip></C>
    ).toMatchSnapshot();

  });

});
