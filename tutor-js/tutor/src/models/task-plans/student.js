import Map from 'shared/model/map';
import moment from 'moment-timezone';
import { readonly } from 'core-decorators';
import { computed, action, observable } from 'mobx';
import { filter, groupBy, sortBy, pickBy } from 'lodash';
import StudentTask from './student/task';
import ResearchSurveys from '../research-surveys';
import Time from '../time';

const MAX_POLLING_ATTEMPTS = 10;
const POLL_SECONDS = 30;
const WEEK_FORMAT = 'GGGGWW';
const FETCH_INITIAL_TASKS_INTERVAL = 1000 * 60; // every minute;
const REFRESH_TASKS_INTERVAL = 1000 * 60 * 60 * 4; // every 4 hours

export
class StudentTaskPlans extends Map {
  @readonly static Model = StudentTask;

  @observable researchSurveys;
  @observable expecting_assignments_count = 0;
  @observable all_tasks_are_ready = false;
  @observable refreshTimer;

  constructor({ course } = {}) {
    super();
    this.course = course;
  }

  @computed get byWeek() {
    const weeks = groupBy(this.array, event => moment(event.due_at).startOf('isoWeek').format(WEEK_FORMAT));
    const sorted = {};
    for (let weekId in weeks) {
      const events = weeks[weekId];
      sorted[weekId] = sortBy(events, 'due_at');
    }
    return sorted;
  }

  @computed get pastTasksByWeek() {
    const thisWeek = moment(Time.now).startOf('isoWeek').format(WEEK_FORMAT);
    return pickBy(this.byWeek, (events, week) => week < thisWeek);
  }

  weeklyTasksForDay(day) {
    return this.byWeek[moment(day).startOf('isoWeek').format(WEEK_FORMAT)] || [];
  }

  @computed get startOfThisWeek() {
    return moment(Time.now).startOf('isoWeek');
  }

  @computed get endOfThisWeek() {
    return this.startOfThisWeek.clone().add(1, 'week').subtract(1, 'second');
  }

  @computed get thisWeeksTasks() {
    return this.weeklyTasksForDay(this.startOfThisWeek);
  }

  // Returns events who's due after this week
  @computed get upcomingTasks() {
    const endOfWeek = this.endOfThisWeek;
    return sortBy(
      filter(
        this.array, event => endOfWeek.isBefore(event.due_at)
      ),
      ['due_at', 'type', 'title']
    );
  }

  // note: the response also contains limited course and role information but they're currently unused
  onLoaded({ data: { tasks, research_surveys, all_tasks_are_ready } }) {
    this.researchSurveys = research_surveys ? new ResearchSurveys(research_surveys) : null;
    this.mergeModelData(tasks);
    this.all_tasks_are_ready = all_tasks_are_ready;
  }

  @computed get isPendingTaskLoading() {
    return Boolean(
      (false === this.all_tasks_are_ready) &&
        this.course.primaryRole.joinedAgo('minutes') < 30
    );
  }

  @computed get taskReadinessTimedOut() {
    return Boolean(
      (false === this.all_tasks_are_ready) &&
        this.course.primaryRole.joinedAgo('minutes') > 30
    );
  }

  @action.bound fetchTaskPeriodically() {
    return this.fetch().then(() => {
      const interval = this.isPendingTaskLoading ?
        FETCH_INITIAL_TASKS_INTERVAL : REFRESH_TASKS_INTERVAL;
      this.refreshTimer = setTimeout(this.fetchTaskPeriodically, interval);
    });
  }

  @action startFetching() {
    return this.refreshTimer ? Promise.resolve() : this.fetchTaskPeriodically();
  }

  @action stopFetching() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // called from API
  fetch() {
    return { courseId: this.course.id };
  }

}
