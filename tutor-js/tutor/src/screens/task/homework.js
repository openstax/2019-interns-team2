import {
  React, PropTypes, styled, observer,
} from '../../helpers/react';
import UX from './ux';
import { Breadcrumbs } from './breadcrumbs';
import { TaskStep } from './step';

const SyledHomework = styled.div`

`;

export default
@observer
class HomeworkTask extends React.Component {

  static propTypes = {
    ux: PropTypes.instanceOf(UX).isRequired,
    windowImpl: PropTypes.object,
  }

  render() {
    const { ux, windowImpl } = this.props;

    return (
      <SyledHomework className="homework-task">
        <Breadcrumbs ux={ux} />
        <TaskStep
          ux={ux}
          step={ux.currentGroupedStep}
          windowImpl={windowImpl}
        />
      </SyledHomework>
    );
  }

}
