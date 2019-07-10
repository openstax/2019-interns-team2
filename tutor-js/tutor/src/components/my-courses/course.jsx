import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { omit } from 'lodash';
import { computed, action } from 'mobx';
import Router from '../../helpers/router';
import TutorLink from '../link';
import { Icon } from 'shared';
import CourseModel from '../../models/course';
import CourseUX from '../../models/course/ux';
import OXFancyLoader from 'shared/components/staxly-animation';

import { wrapCourseDragComponent } from './course-dnd';
import CourseBranding from '../branding/course';

const CoursePropType = PropTypes.shape({
  id:   PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  term: PropTypes.string.isRequired,
  is_concept_coach: PropTypes.bool.isRequired,
});


@observer
class CoursePreview extends React.Component {

  static contextTypes = {
    router: PropTypes.object,
  }

  static propTypes = {
    course: PropTypes.instanceOf(CourseModel).isRequired,
    className: PropTypes.string,
  }

  @computed get ux () {
    return new CourseUX(this.props.course);
  }

  @action.bound redirectToCourse() {
    const { props: { course: { previewCourse } } } = this;
    if ( !previewCourse ) { return; }
    this.context.router.history.push(Router.makePathname(
      'dashboard', { courseId: previewCourse.id },
    ));
  }

  @action.bound onClick() {
    const { course } = this.props;
    if (course.isCreated) {
      this.redirectToCourse();
    } else {
      course.build().then(this.redirectToCourse);
    }
  }

  @computed get previewMessage() {
    if (this.props.course.isBuilding) {
      return <h4 key="title">Loading Preview</h4>;
    }
    return [
      <h4 key="title"><Icon type="eye" /> Preview</h4>,
      <p key="message">Check out a course with assignments and sample data</p>,
    ];
  }

  render() {
    const { course, className } = this.props;
    const itemClasses = classnames('my-courses-item', 'preview', className, {
      'is-building': course.isBuilding,
    });
    return (
      <div className="my-courses-item-wrapper preview">
        <div
          {...this.ux.dataProps}
          data-is-teacher={true}
          data-course-id={course.id}
          data-course-course-type={'tutor'}
          className={itemClasses}
        >
          <a
            className="my-courses-item-title"
            onClick={this.onClick}
          >
            <h3 className="name">{course.name}</h3>
            <div className="preview-belt">
              {this.previewMessage}
              <OXFancyLoader isLoading={course.isBuilding} />
            </div>
          </a>
        </div>
      </div>
    );

  }
}


class Course extends React.Component {

  static propTypes = {
    course: PropTypes.instanceOf(CourseModel).isRequired,
    className:        PropTypes.string,
    controls:         PropTypes.element,
  }

  @computed get ux () {
    return new CourseUX(this.props.course);
  }

  renderControls(controls) {
    return (
      <div className="my-courses-item-controls">
        {controls}
      </div>
    );
  }

  render() {
    const { course, controls } = this.props;
    return (
      <div className="my-courses-item-wrapper">
        <div
          {...this.ux.dataProps}
          data-is-teacher={this.ux.course.isTeacher}
          data-course-id={this.ux.courseId}
          data-course-course-type={this.ux.courseType}
          className={classnames('my-courses-item', this.props.className)}
        >
          <div className="my-courses-item-title">
            <TutorLink to="dashboard" params={{ courseId: this.ux.courseId }}>
              {course.name}
            </TutorLink>
          </div>
          <div
            className="my-courses-item-details"
            data-has-controls={controls != null}>
            <TutorLink to="dashboard" params={{ courseId: this.ux.courseId }}>
              <CourseBranding
                tag="p"
                className="my-courses-item-brand"
                isConceptCoach={!!course.is_concept_coach}
              />
              <p className="my-courses-item-term">
                {course.term}
                {' '}
                {course.year}
              </p>
            </TutorLink>
            {controls && this.renderControls(controls)}
          </div>
        </div>
      </div>
    );
  }
}


@wrapCourseDragComponent
class CourseTeacher extends React.Component {

  static propTypes = omit(Course.propTypes, 'controls');

  render() {
    const { course } = this.props;
    const link =
      <TutorLink
        to="createNewCourse"
        params={{ sourceId: course.id }}
        className="btn btn-default btn-sm"
      >
        Copy this course
      </TutorLink>;

    return (
      this.props.connectDragSource(
        <div
          className={classnames('course-teacher', { 'is-dragging': this.props.isDragging })}>
          <Course {...this.props} controls={link} />
        </div>
      )
    );
  }
}

export { CoursePropType, CoursePreview, Course, CourseTeacher };
