// This file manages all async state transitions.
//
// These attach to actions to help state changes along.
//
// For example, `TaskActions.load` everntually yields either
// `TaskActions.loaded` or `TaskActions.FAILED`
import adapters from './adapter';
import { CourseGuideActions } from '../flux/guide';
import * as PerformanceForecast from '../flux/performance-forecast';

import { TaskPlanActions, TaskPlanStore } from '../flux/task-plan';
import { CCDashboardActions } from '../flux/cc-dashboard';
import Exercises from '../models/exercises';
import ReferenceBook from '../models/reference-book';
import ReferenceBookPage from '../models/reference-book/page';
import Ecosystems from '../models/ecosystems';
import { ReferenceBookExerciseActions } from '../flux/reference-book-exercise';
import TaskPlanHelpers from '../helpers/task-plan';
import Survey from '../models/research-surveys/survey';
import Job from '../models/job';
import User from '../models/user';
import { UserTerms } from '../models/user/terms';
import Course from '../models/course';
import Period from '../models/course/period';
import Courses from '../models/courses-map';
import Offerings from '../models/course/offerings';
import CourseCreate from '../models/course/create';
import { StudentTaskPlans } from '../models/task-plans/student';
import { TeacherTaskPlans } from '../models/task-plans/teacher';
import { PastTaskPlans } from '../models/task-plans/teacher/past';
import { StudentTasks, StudentTask, StudentTaskStep } from '../models/student-tasks';
import StudentTaskPlan from '../models/task-plans/student/task';
import Student from '../models/course/student';
import CourseEnroll from '../models/course/enroll';
import Purchases from '../models/purchases';
import Purchase from '../models/purchases/purchase';
import CourseRoster from '../models/course/roster';
import CourseLMS from '../models/course/lms';
import CoursePairLMS from '../models/course/pair-to-lms';
import CourseScores from '../models/scores';
import ScoresExport from '../models/jobs/scores-export';
import LmsPushScores from '../models/jobs/lms-score-push';
import TaskResult from '../models/scores/task-result';
import CourseTeacher from '../models/course/teacher';
import TeacherTaskPlan from '../models/task-plans/teacher/plan';
import TaskPlanStats from '../models/task-plans/teacher/stats';
import ResponseValidation from '../models/response_validation';
import { Notes, PageNotes, Note } from '../models/notes';

const {
  connectRead, connectUpdate, connectDelete,
  connectModelCreate, connectModelRead, connectModelUpdate, connectModelDelete,
} = adapters;

const startAPI = function() {

  connectRead(TaskPlanActions, { pattern: 'plans/{id}' });
  connectDelete(TaskPlanActions, { pattern: 'plans/{id}' });

  connectUpdate(TaskPlanActions, { data: TaskPlanStore.getChanged }, TaskPlanHelpers.apiEndpointOptions);

  connectUpdate(
    TaskPlanActions,
    {
      trigger: 'saveSilent',

      handleError(...args) {
        TaskPlanActions.erroredSilent(...Array.from(args || []));
        return true;
      },

      data: TaskPlanStore.getChanged,
    },
    TaskPlanHelpers.apiEndpointOptions,
  );


  connectRead(CourseGuideActions, { pattern: 'courses/{id}/guide' });
  connectRead(CCDashboardActions, { pattern: 'courses/{id}/cc/dashboard' });

  connectRead(PerformanceForecast.Student.actions, function(id) {
    const course = Courses.get(id);
    const params = {};
    if (course && course.current_role_id) {
      params.role_id = course.current_role_id;
    }
    return { url: `courses/${id}/guide`, params };
  });
  connectRead(PerformanceForecast.Teacher.actions, { pattern: 'courses/{id}/teacher_guide' });
  connectRead(PerformanceForecast.TeacherStudent.actions, function(id, { roleId }) {
    const url = `courses/${id}/guide/role/${roleId}`;
    const data = { id, roleId };
    return { url, data };
  });

  connectRead(ReferenceBookExerciseActions, { url(url) { return url; } });
  connectModelRead(Exercises.constructor, 'fetch', { onSuccess: 'onLoaded' });
  connectModelRead(Ecosystems.constructor, 'fetch', { onSuccess: 'onLoaded', url: 'ecosystems' });

  connectModelRead(ReferenceBook, 'fetch', { pattern: 'ecosystems/{id}/readings', onSuccess: 'onApiRequestComplete' });
  connectModelRead(ReferenceBookPage, 'fetchContent', {
    pattern: 'ecosystems/{ecosystemId}/pages/{cnx_id}',
    onSuccess: 'onContentFetchComplete',
    onFail: 'onContentFetchFail',
  });

  // "User" is actually an instance, but connectModel works at the class level
  connectModelUpdate(User.constructor, 'saveTourView',
    { pattern: 'user/tours/{id}' }
  );

  connectModelUpdate(Note, 'save', {
    onSuccess: 'onUpdated',
    method() { return this.isNew ? 'POST' : 'PATCH'; },
    pattern() { return 'courses/{courseId}/notes/{chapterSection}' + (this.isNew ? '' : '/{id}'); },
  });
  connectModelDelete(Note, 'destroy', {
    onSuccess: 'onDeleted',
    pattern: 'courses/{courseId}/notes/{chapterSection}/{id}',
  });
  connectModelRead(PageNotes, 'fetch', {
    onSuccess: 'onLoaded',
    pattern: 'courses/{courseId}/notes/{chapterSection}',
  });
  connectModelRead(Notes, 'fetchHighlightedSections', {
    onSuccess: 'onHighlightedSectionsLoaded',
    pattern: 'courses/{courseId}/highlighted_sections',
  });

  connectModelRead(Course, 'fetch', { pattern: 'courses/{id}' });

  connectModelRead(UserTerms, 'fetch', { onSuccess: 'onLoaded', url: 'terms' });
  connectModelUpdate(UserTerms, 'sign', { onSuccess: 'onSigned', pattern: 'terms/{ids}', method: 'PUT' });
  connectModelUpdate(Survey, 'save',
    { pattern: 'research_surveys/{id}' }
  );
  connectModelRead(Purchases.constructor, 'fetch', { onSuccess: 'onLoaded', url: 'purchases' });
  connectModelUpdate(
    Purchase,
    'refund',
    {
      onSuccess: 'onRefunded',
      pattern: 'purchases/{item_uuid}/refund',
      method: 'PUT',
      data() { return { survey: this.refund_survey }; },
    },
  );
  connectModelCreate(
    User.constructor,
    'logEvent',
    {
      method: 'POST',
      pattern: 'log/event/{category}/{code}',
      data({ data }) { return { data }; },
    },
  );
  connectModelRead(Offerings.constructor, 'fetch', { url: 'offerings', onSuccess: 'onLoaded' });

  connectModelCreate(CourseCreate, 'save', { onSuccess: 'onCreated' });

  connectModelRead(
    TeacherTaskPlans,
    'fetch',
    {
      pattern: 'courses/{course.id}/dashboard',
      onSuccess: 'onLoaded',

      params({ startAt, endAt }) {
        return {
          start_at: startAt,
          end_at: endAt,
        };
      },
    },
  );

  connectModelRead(
    PastTaskPlans,
    'fetch',
    {
      pattern: 'courses/{course.id}/plans',
      onSuccess: 'onLoaded',

      params: {
        clone_status: 'unused_source',
      },
    },
  );

  connectModelRead(ResponseValidation, 'validate',
    { pattern: 'validate', onSuccess: 'onValidationComplete', onFail: 'onFailure',
      timeout: 2000, // wait a max of 2 seconds
    });

  connectModelUpdate(Student, 'saveOwnStudentId', { pattern: 'user/courses/{course.id}/student', onSuccess: 'onApiRequestComplete' });
  connectModelUpdate(Student, 'saveStudentId', { pattern: 'students/{id}', onSuccess: 'onApiRequestComplete' });
  connectModelUpdate(Student, 'savePeriod', { pattern: 'students/{id}', onSuccess: 'onApiRequestComplete' });
  connectModelDelete(Student, 'drop', { pattern: 'students/{id}', onSuccess: 'onApiRequestComplete' } );
  connectModelUpdate(Student, 'unDrop', { pattern: 'students/{id}/undrop', method: 'PUT', onSuccess: 'onApiRequestComplete' } );


  connectModelCreate(CourseEnroll, 'create', { url: 'enrollment', onSuccess: 'onEnrollmentCreate', onFail: 'setApiErrors' });
  connectModelUpdate(
    CourseEnroll,
    'confirm',
    {
      pattern: 'enrollment/{id}/approve',
      method: 'PUT',
      onSuccess: 'onApiRequestComplete',
      onFail: 'setApiErrors',
    },
  );

  connectModelCreate(StudentTasks, 'practice', {
    pattern: 'courses/{courseId}/practice',
  });

  connectModelRead(StudentTask, 'fetch', {
    onSuccess: 'onFetchComplete', onFail: 'setApiErrors', pattern: '/tasks/{id}',
  });

  connectModelUpdate(StudentTaskStep, 'save', {
    onSuccess: 'onAnswerSaved', onFail: 'setApiErrors', pattern: 'steps/{id}',
  });

  connectModelRead(StudentTaskStep, 'fetch', {
    onSuccess: 'onLoaded', onFail: 'setApiErrors', pattern: 'steps/{id}',
  });

  connectModelRead(StudentTaskPlans, 'fetch', { onSuccess: 'onLoaded', pattern: 'courses/{courseId}/dashboard' });
  connectModelDelete(StudentTaskPlan, 'hide', { onSuccess: 'onHidden', pattern: 'tasks/{id}' });

  connectModelUpdate(Course, 'save', { pattern: 'courses/{id}', onSuccess: 'onApiRequestComplete' });
  connectModelUpdate(Course,
    'saveExerciseExclusion', { pattern: 'courses/{id}/exercises', onSuccess: 'onExerciseExcluded' }
  );

  connectModelRead(CourseLMS, 'fetch', { pattern: 'lms/courses/{course.id}', onSuccess: 'onApiRequestComplete' });

  connectModelUpdate(CoursePairLMS, 'save', { method: 'POST', pattern: 'lms/courses/{course.id}/pair', onSuccess: 'onPaired' });

  connectModelUpdate(LmsPushScores, 'start', { method: 'PUT', pattern: 'lms/courses/{course.id}/push_scores', onSuccess: 'onStarted' });

  connectModelRead(CourseRoster, 'fetch', { pattern: 'courses/{courseId}/roster', onSuccess: 'onApiRequestComplete' });

  connectModelDelete(CourseTeacher, 'drop', { pattern: 'teachers/{id}', onSuccess: 'onDropped' });

  connectModelCreate(Period, 'create', { pattern: 'courses/{courseId}/periods', onSuccess: 'afterCreate' });

  connectModelUpdate(Period, 'createTeacherStudent', { method: 'PUT', pattern: 'periods/{id}/teacher_student', onSuccess: 'onCreateTeacherStudent' });

  connectModelUpdate(Period, 'save', { pattern: 'periods/{id}', onSuccess: 'onApiRequestComplete' });
  connectModelDelete(Period, 'archive', { pattern: 'periods/{id}', onSuccess: 'onApiRequestComplete' });
  connectModelUpdate(Period, 'unarchive', { pattern: 'periods/{id}', onSuccess: 'onApiRequestComplete' });

  connectModelRead(CourseScores, 'fetch',
    { pattern: 'courses/{courseId}/performance', onSuccess: 'onFetchComplete' });

  connectModelUpdate(TaskResult, 'acceptLate', { method: 'PUT', pattern: 'tasks/{id}/accept_late_work', onSuccess: 'onLateWorkAccepted' });

  connectModelUpdate(TaskResult, 'rejectLate', { method: 'PUT', pattern: 'tasks/{id}/reject_late_work', onSuccess: 'onLateWorkRejected' });

  connectModelRead(Job, 'requestJobStatus', { onSuccess: 'onJobUpdate', onFail: 'onJobUpdateFailure', pattern: 'jobs/{jobId}' });

  connectModelCreate(ScoresExport, 'create', { onSuccess: 'onCreated', pattern: 'courses/{course.id}/performance/export' });

  connectModelRead(TeacherTaskPlan, 'fetch', { onSuccess: 'onApiRequestComplete', pattern: 'plans/{id}' });
  connectModelRead(TaskPlanStats, 'fetch', { onSuccess: 'onApiRequestComplete', pattern: 'plans/{id}/stats' });

  connectModelRead(TaskPlanStats, 'fetchReview', { onSuccess: 'onApiRequestComplete', pattern: 'plans/{id}/review' });

  return connectModelRead(Courses.constructor, 'fetch', { onSuccess: 'onLoaded', url: 'user/courses' });
};


export default {
  boot: startAPI,
};
