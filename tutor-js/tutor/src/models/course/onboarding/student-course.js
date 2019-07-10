import {
  computed, observable, action,
} from 'mobx';
import { get } from 'lodash';
import UiSettings from 'shared/model/ui-settings';
import BaseOnboarding from './base';
import Nags from '../../../components/onboarding/nags';
import Payments from '../../payments';
import User from '../../user';

const PAY_LATER_CHOICE  = 'PL';
const TRIAL_ACKNOWLEDGED = 'FTA';

export default class StudentCourseOnboarding extends BaseOnboarding {

  @observable displayPayment = false;
  @observable displayTrialActive = false;

  @computed get nagComponent() {
    if (this.needsTermsSigned) { return null; }

    if (this.displayPayment) { return Nags.makePayment; }
    if (!Payments.config.is_enabled && this.course.does_cost){
      if (!UiSettings.get(TRIAL_ACKNOWLEDGED, this.course.id)) {
        return Nags.payDisabled;
      }
    } else if (this.course.needsPayment) {
      if (this.course.userStudentRecord.mustPayImmediately) {
        return Nags.freeTrialEnded;
      } else if (this.displayTrialActive) {
        return Nags.freeTrialActivated;
      } else if (!UiSettings.get(PAY_LATER_CHOICE, this.course.id)) {
        return Nags.payNowOrLater;
      }
    }

    return null;
  }

  @computed get needsTermsSigned() {
    return Boolean(User.terms_signatures_needed && !this.paymentIsPastDue);
  }

  @computed get isDisplaying() {
    return Boolean(this.nagComponent);
  }

  @computed get paymentIsPastDue() {
    return get(this.course, 'userStudentRecord.mustPayImmediately', false);
  }

  @action.bound
  acknowledgeTrial() {
    UiSettings.set(TRIAL_ACKNOWLEDGED, this.course.id, true);
  }

  @action.bound
  payNow() {
    this.displayPayment = true;
  }

  @action.bound
  onAccessCourse() {
    this.displayTrialActive = false;
  }

  @action.bound
  onPayLater() {
    UiSettings.set(PAY_LATER_CHOICE, this.course.id, true);
    this.displayTrialActive = true;
    this.displayPayment = false;
  }

  @action.bound
  onPaymentComplete() {
    if (this.paymentIsPastDue) {
      // in this case we have to reload since network requests have been failing silently
      setTimeout(() => window.location.reload());
    } else {
      this.displayPayment = false;
      this.course.userStudentRecord.markPaid();
      // fetch tasks since they could not be fetched while student was in unpaid status
      this.course.studentTaskPlans.startFetching();
    }
  }

  mount() {
    super.mount();
    if (!this.paymentIsPastDue) {
      this.course.studentTaskPlans.startFetching();
    }
    this.tourContext.otherModal = this;
  }

  close() {
    super.close();
    this.course.studentTaskPlans.stopFetching();
    this.tourContext.otherModal = null;
  }

}
