import { extend, last, random } from 'lodash';
import S from '../../helpers/string';
import { observable, computed, action } from 'mobx';
import ResponseValidation from '../../models/response_validation';
import Raven from '../../models/app/raven';

export
class ResponseValidationUX {

  @observable initialResponse;
  @observable retriedResponse;
  @observable messages;
  @observable messageIndex;
  @observable results = [];

  constructor({ step, messages, validator = new ResponseValidation() }) {
    this.step = step;
    this.validator = validator;
    this.messages = messages;
    this.messageIndex = random(0, messages.length - 1);
  }

  @computed get nudge() {
    return this.messages[this.messageIndex];
  }

  @action.bound setResponse({ target: { value } }) {
    if (this.isDisplayingNudge) {
      this.retriedResponse = value;
    } else {
      this.initialResponse = value;
    }
  }

  @computed get response() {
    return this.isDisplayingNudge ? this.retriedResponse : this.initialResponse;
  }

  @action.bound async onSave() {
    if (!this.validator.isEnabled) {
      this.step.beginRecordingAnswer({ free_response: this.initialResponse });
      return;
    }
    const result = await this.validate();

    if (this.validator.isUIEnabled) {
      this.advanceUI(result);
    } else {
      this.step.beginRecordingAnswer({ free_response: result.response });
    }
    this.results.push(result);

    this.step.response_validation = { attempts: this.results };
  }

  @action async validate() {
    // Nudges are only displayed on the first attempt, only save the message if it was shown.
    const nudge = this.validator.isUIEnabled && S.isEmpty(this.results) ? this.nudge.title : null;
    const submitted = this.response;
    try {
      const reply = await this.validator.validate({
        uid: this.step.uid,
        response: submitted,
      });
      const validation = extend({}, reply.data, {
        response: submitted, nudge,
      });
      this.step.spy.response_validation = validation;
      return validation;
    } catch (err) {
      Raven.captureException(err);
      return {
        valid: true,
        exception: err.toString(),
        response: submitted,
        nudge,
      };
    }
  }

  @action advanceUI(result) {
    if (result.valid || this.isDisplayingNudge) {
      this.step.beginRecordingAnswer({ free_response: result.response });
    } else {
      this.retriedResponse = this.initialResponse;
    }
  }

  @action.bound submitOriginalResponse(ev) {
    ev && ev.preventDefault();
    this.step.beginRecordingAnswer({ free_response: this.initialResponse });
  }

  @computed get submitBtnLabel() {
    return this.isDisplayingNudge ? 'Re-answer' : 'Answer';
  }

  @computed get displayNudgeError() {
    return Boolean(
      this.isDisplayingNudge && this.initialResponse === this.retriedResponse
    );
  }

  @computed get isSubmitDisabled() {
    return Boolean(
      this.displayNudgeError || S.isEmpty(this.response),
    );
  }

  @computed get isDisplayingNudge() {
    return Boolean(
      this.validator.isUIEnabled &&
        this.results.length && !last(this.results).valid
    );
  }

}
