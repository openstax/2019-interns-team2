import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react';
import { computed, action } from 'mobx';
import { Col } from 'react-bootstrap';
import { get } from 'lodash';
import Time from '../../components/time';
import Router from '../../helpers/router';
import classnames from 'classnames';
import HideButton from './hide-button';
import TaskProgressInfo from './task-progress-info';
import Course from '../../models/course';

const EventTime = ({ event }) => {
  if (event.is_deleted) { return null; }
  return <Time date={event.due_at} format="concise" />;
};

EventTime.propTypes = {
  event:     PropTypes.object.isRequired,
};

export default
@observer
class EventRow extends React.Component {

  static propTypes = {
    event:     PropTypes.object.isRequired,
    course:    PropTypes.instanceOf(Course).isRequired,
  }

  static contextTypes = {
    router: PropTypes.object,
  }

  @action.bound onClick(ev) {
    ev.preventDefault();
    if (this.isWorkable) {
      this.context.router.history.push(
        ev.currentTarget.getAttribute('href')
      );
    }
  }

  @computed get isWorkable() {
    return get(this.props, 'workable', this.props.event.canWork);
  }

  render() {
    const { event, course } = this.props;
    if (event.hidden) { return null; }

    const classes = classnames(`task row ${event.type}`, {
      workable: this.isWorkable,
      deleted: event.is_deleted,
    });

    return (
      <a
        className={classes}
        href={Router.makePathname('viewTask', { courseId: course.id, id: event.id })}
        aria-label={`Work on ${event.type}: ${this.props.event.title}`}
        tabIndex={this.isWorkable ? 0 : -1}
        onClick={this.onClick}
        onKeyDown={this.isWorkable ? this.onKey : undefined}
        data-event-id={this.props.event.id}
      >
        <Col xs={2} sm={1} className="column-icon">
          <i
            aria-label={`${event.type} icon`}
            className={`icon icon-lg icon-${event.type}`} />
        </Col>
        <Col xs={10} sm={5} className="title">
          {event.title}
        </Col>
        <Col xs={5} sm={3} className="due-at">
          <EventTime event={event} />
          <HideButton event={event} />
        </Col>
        <Col xs={5} sm={3} className="feedback">
          <TaskProgressInfo event={event} course={course} />
        </Col>
      </a>
    );
  }
}
