import PropTypes from 'prop-types';
import React from 'react';
import { Button, Popover, OverlayTrigger } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { Icon } from 'shared';
import Name from '../../components/name';
import Student from '../../models/course/student';

export default
@observer
class DropStudentLink extends React.Component {

  static propTypes = {
    student: PropTypes.instanceOf(Student).isRequired,
  }

  @action.bound performDeletion() {
    this.props.student.drop();
  }

  popOverTitle() {
    if (this.props.student.api.isPending) {
      return (
        <span><Icon type="spinner" spin />Dropping…</span>
      );
    }
    return (
      <span>
        Drop <Name {...this.props.student} />
      </span>
    );
  }

  confirmPopOver() {
    return (
      <Popover id="drop-student" title={this.popOverTitle()}>
        <Button className="-drop-student" onClick={this.performDeletion} variant="danger">
          <Icon type="ban" /> Drop
        </Button>
      </Popover>
    );
  }

  render() {
    return (
      <OverlayTrigger
        rootClose={true}
        trigger="click"
        placement="left"
        overlay={this.confirmPopOver()}
      >
        <a>
          <Icon type="ban" /> Drop
        </a>
      </OverlayTrigger>
    );
  }
};
