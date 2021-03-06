import { reduce, map, filter, isEmpty, findIndex } from 'lodash';
import { computed, action } from 'mobx';
import Big from 'big.js';
import moment from 'moment';
import {
  BaseModel, identifiedBy, field, belongsTo,
} from 'shared/model';
import Time from '../time';

export default
@identifiedBy('scores/heading')
class Heading extends BaseModel {
  @field({ type: 'bignum' }) average_score;
  @field({ type: 'bignum' }) average_progress;
  @field({ type: 'date' }) due_at;
  @field plan_id;
  @field title;
  @field type;
  @belongsTo({ model: 'scores/period' }) period;

  @computed get columnIndex() {
    return findIndex(this.period.data_headings, this);
  }

  @computed get isDue() {
    return moment(this.due_at).isBefore(Time.now);
  }

  @computed get tasks() {
    return map(this.period.students, (s) => s.data[this.columnIndex]);
  }

  @action adjustScores() {
    this.average_score = this.averageForType('score');
    this.average_progress = this.averageForType('progress');
  }

  averageForType(attr) {
    const tasks = filter(this.tasks, 'student.isActive');
    if (isEmpty(tasks)) { return null; }

    return reduce(tasks,
      (acc, s) => acc.plus(s[attr] || 0),
      new Big(0)
    ).div(tasks.length);
  }

}
