import { React, observer, cn, action } from '../../helpers/react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import moment from 'moment';
import Course from '../../models/course';
import { TimeStore } from '../../flux/time';
import TimeHelper from '../../helpers/time';
import Time from '../../models/time';

import AddMenu from './add-menu';

export default
@observer
class AddAssignmentPopUp extends React.Component {

  static propTypes = {
    course: PropTypes.instanceOf(Course).isRequired,
    x: PropTypes.number,
    y: PropTypes.number,
    date: PropTypes.object,
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  addMenu = new AddMenu({ router: this.context.router });

  get dateType() {
    const { date } = this.props;
    const { start, end } = this.props.course.bounds;
    if (date.isBefore(start, 'day')) {
      return 'day before term starts';
    } else if (date.isAfter(end, 'day')) {
      return 'day after term ends';
    } else if (date.isBefore(Time.now, 'day')) {
      return 'past day';
    }
    return null;
  }

  render() {
    let dropdownContent;
    const { date, x, y } = this.props;

    if (!date) { return null; }

    // DYNAMIC_ADD_ON_CALENDAR_POSITIONING
    // Positions Add menu on date
    const style = {
      left: x,
      top: y,
    };

    const addDateType = this.dateType;
    const className = cn('course-add-dropdown', { 'no-add': addDateType });
    // only allow add if addDate is on or after reference date
    dropdownContent = addDateType ? (
      <li>
        <span className="no-add-text">Cannot assign to {addDateType}</span>
      </li>
    ) : this.addMenu.render(this.props);


    return (
      <Dropdown.Menu
        show
        id="course-add-dropdown"
        ref="addOnDayMenu"
        style={style}
        className={className}
      >
        {dropdownContent}
      </Dropdown.Menu>
    );
  }
};
