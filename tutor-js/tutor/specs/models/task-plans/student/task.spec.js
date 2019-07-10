import { TimeMock, Factory } from '../../../helpers';
import COURSE_1_DATA from '../../../../api/courses/1/dashboard.json';
import moment from 'moment';

jest.mock('../../../../src/flux/time', () => ({
  TimeStore: {
    getNow: jest.fn(() => new Date()),
  },
}));

describe('Student Task Model', () => {

  let task;
  const now = new Date('2017-10-14T12:00:00.000Z');
  TimeMock.setTo(now);

  beforeEach(() => {
    task = Factory.studentDashboardTask();
  });

  it('#canWork', () => {
    task.opens_at = moment(now).add(1, 'day');
    expect(task.canWork).toBe(false);
    task.opens_at = moment(now).subtract(1, 'day');
    expect(task.canWork).toBe(true);
    task.is_deleted = true;
    task.complete_exercise_count = 0;
    expect(task.canWork).toBe(false);
    task.complete_exercise_count = 1;
    expect(task.canWork).toBe(true);
  });

  it('#lateWorkIsAccepted', () => {
    expect(task.lateWorkIsAccepted).toBe(false);
    task.accepted_late_at = now;
    task.last_worked_at = moment(now).subtract(1, 'day');
    expect(task.lateWorkIsAccepted).toBe(true);
    task.last_worked_at = moment(now).add(1, 'day');
    expect(task.lateWorkIsAccepted).toBe(false);
  });

  it('hw#studentFeedback', () => {
    task.complete = false;
    task.completed_steps_count = 0;
    task.correct_exercise_count = 0;
    task.type = 'homework';
    expect(task.studentFeedback).toEqual('Not started');
    task.completed_steps_count = 1;
    task.complete_exercise_count = 1;

    task.exercise_count = 3;
    expect(task.studentFeedback).toEqual('1/3 answered');
    task.due_at = moment(now).subtract(1, 'day');
    task.complete = true;
    task.correct_exercise_count = 1;
    expect(task.studentFeedback).toEqual('1/3 correct');
  });

  it('reading#studentFeedback', () => {
    task.complete = false;
    task.completed_steps_count = 0;
    task.type = 'reading';
    expect(task.studentFeedback).toEqual('Not started');
    task.completed_steps_count = 1;
    expect(task.studentFeedback).toEqual('In progress');
    task.complete = true;
    expect(task.studentFeedback).toEqual('Complete');
  });

  it('external#studentFeedback', () => {
    task.complete = false;
    task.type = 'external';
    expect(task.studentFeedback).toEqual('Not started');
    task.complete = true;
    expect(task.studentFeedback).toEqual('Clicked');
  });

});
