import React from 'react';
import { observable, computed, action } from 'mobx';
import Router from '../../helpers/router';
import { extend } from 'lodash';
import User from '../../models/user';
import MenuToggle from '../../components/book-menu/toggle';
import SectionTitle from './section-title';
import NotesSummaryToggle from '../../components/notes/summary-toggle';
import TeacherContentToggle from './teacher-content-toggle';
import BookUX from '../../models/reference-book/ux';

const TEACHER_CONTENT_SELECTOR = '.os-teacher';

export default class ReferenceBookUX extends BookUX {

  @observable isShowingTeacherContent = false;
  @observable hasTeacherContent = false;
  @observable navBar;

  @action.bound toggleTeacherContent() {
    this.isShowingTeacherContent = !this.isShowingTeacherContent;
  }

  @action checkForTeacherContent() {
    this.hasTeacherContent = Boolean(
      document.querySelector(TEACHER_CONTENT_SELECTOR)
    );
    this.pendingCheck = null;
  }

  constructor(router, tours, options = {}) {
    super(options);
    this.tours = tours;
    this.router = router;
  }

  @computed get allowsAnnotating() {
    return User.canAnnotate;
  }

  @action setNavBar(nav) {
    nav.className='reference-book';
    nav.childProps.set('ux', this);
    nav.left.replace({
      'slide-out-menu-toggle': MenuToggle,
      'section-title': SectionTitle,
    });
    nav.center.merge({
      'note-toggle': () => <NotesSummaryToggle course={this.course} />,
    });
    if (this.course && this.course.isTeacher) {
      nav.right.replace({
        'teacher-content-toggle': TeacherContentToggle,
      });
    } else {
      nav.right.clear();
    }

    this.navBar = nav;
  }

  sectionHref(section) {
    if (!section || !this.courseId) { return null; }
    return Router.makePathname('viewReferenceBookPage', {
      courseId: this.courseId,
      pageId: section.id,
    }, { query: Router.currentQuery() });
  }

  sectionLinkProps(section) {
    return {
      to: 'viewReferenceBookPage',
      params: extend(Router.currentParams(), { pageId: section.id }),
      query: Router.currentQuery(),
    };
  }

  @action.bound onNavSetSection(path) {
    this.router.history.push(path);
  }

  @computed get pageProps() {
    return { ux: this, title: this.page.title };
  }

}
