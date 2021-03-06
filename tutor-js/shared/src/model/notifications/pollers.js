import extend from 'lodash/extend';
import bindAll from 'lodash/bindAll';
import difference from 'lodash/difference';
import without from 'lodash/without';
import keys from 'lodash/keys';
import isEmpty from 'lodash/isEmpty';
import values from 'lodash/values';

import moment from 'moment';
import axios from 'axios';

import User from '../user';
import UiSettings from '../ui-settings';

const STORAGE_KEY = 'ox-notifications';

class Poller {

  static forType(notices, type) {
    return new (POLLER_TYPES[type])(type, notices);
  }

  constructor(type, notices, interval) {
    this.type = type;
    this.notices = notices;
    this.interval = interval;
    this.prefsStorageKey = `${STORAGE_KEY}-${this.type}`;
    bindAll(this, 'poll', 'onReply', 'onError');
  }

  setUrl(url) {
    this.url = url;
    if (!this.polling) { return this.startPolling(); }
  }

  destroy() {
    if (this.polling) { this.notices.windowImpl.clearInterval(this.polling); }
    return delete this.polling;
  }

  startPolling() {
    this.polling = this.notices.windowImpl.setInterval(this.poll, this.interval.asMilliseconds());
    return this.poll();
  }

  poll() {
    if (this.notices.windowImpl.document.hidden === true) { return; }
    return axios.get(this.url, { withCredentials: true }).then(this.onReply).catch(this.onError);
  }

  onReply({ data }) {
    return console.warn('base onReply method called unnecessarily');
  }

  onError(resp) {
    return console.warn(resp);
  }

  getActiveNotifications() {
    return values(this._activeNotices);
  }

  acknowledge(notice) {
    this._setObservedNoticeIds(
      this._getObservedNoticeIds().concat(notice.id)
    );
    delete this._activeNotices[notice.id];
    return this.notices.emit('change');
  }

  _setObservedNoticeIds(newIds) {
    return UiSettings.set(this.prefsStorageKey, newIds);
  }

  _getObservedNoticeIds() {
    return UiSettings.get(this.prefsStorageKey) || [];
  }

  _setActiveNotices(newActiveNotices, currentIds) {
    this._activeNotices = newActiveNotices;
    this.notices.emit('change');
    const observedIds = this._getObservedNoticeIds();

    // Prune the list of observed notice ids so it doesn't continue to fill up with old notices
    const outdatedIds = difference(observedIds, without(currentIds, ...Array.from(keys(newActiveNotices))));
    if (!isEmpty(outdatedIds)) {
      return this._setObservedNoticeIds( without(observedIds, ...Array.from(outdatedIds)) );
    }
  }
}


class TutorUpdates extends Poller {
  constructor(type, notices) {
    super(type, notices, moment.duration(5, 'minutes'));
    this.active = {};
  }

  onReply({ data }) {
    const observedIds = this._getObservedNoticeIds();
    const notices = {};
    const currentIds = [];
    for (let notice of data.notifications) {
      currentIds.push(notice.id);

      if (observedIds.indexOf(notice.id) !== -1) { continue; }
      notices[notice.id] = extend(notice, { type: this.type });
    }

    this._setActiveNotices(notices, currentIds);
    return this.notices.emit('tutor-update', data);
  }
}


class AccountsNagger extends Poller {
  constructor(type, notices) { super(type, notices, moment.duration(1, 'day')); }

  onReply({ data }) {
    User.setCurrent(data);
    const emails = {};
    for (let email of User.current().unVerfiedEmails()) {
      emails[email.id] = extend(email, { type: this.type });
    }
    return this._setActiveNotices(emails, keys(emails));
  }
}


var POLLER_TYPES = {
  tutor: TutorUpdates,
  accounts: AccountsNagger,
};

export default Poller;
