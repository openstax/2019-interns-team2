/* eslint-disable */  // sorry future dev, hopefully you can whip this into shape :(
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment-timezone';
import { isEmpty, isEqual, map, omit, extend, defer, clone, pick, keys, isUndefined } from 'lodash';
import classnames from 'classnames';
import MaskedInput from 'react-maskedinput';
import DatePicker from 'react-datepicker';
import * as TutorErrors from './tutor-errors';
import { TimeStore } from '../flux/time';
import TimeHelper from '../helpers/time';
import { Icon } from 'shared';
import S from '../helpers/string';

const TutorDateFormat = TimeStore.getFormat();

class TutorInput extends React.Component {
  static defaultProps = {
    validate(inputValue) {
      if (isEmpty(inputValue)) { return ['required']; }
    },

    type: 'text',
  };

  static propTypes = {
    label: PropTypes.node.isRequired,
    id: PropTypes.string,
    className: PropTypes.string,
    type: PropTypes.string,
    onChange: PropTypes.func,
    validate: PropTypes.func,
    onUpdated: PropTypes.func,
    autoFocus: PropTypes.bool,
    hasValue: PropTypes.bool,
  };

  state = { errors: [] };

  componentDidMount() {
    const errors = this.props.validate(this.props.default);
    if (!isEmpty(errors)) { this.setState({ errors }); }
    if (this.props.autoFocus) { return defer(() => this.focus().cursorToEnd()); }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevState, this.state)) { return (typeof this.props.onUpdated === 'function' ? this.props.onUpdated(this.state) : undefined); }
  }

  onChange = (event) => {
    // TODO make this more intuitive to parent elements
    this.props.onChange(event.target != null ? event.target.value : undefined, event.target, event);
    return this.validate(event.target != null ? event.target.value : undefined);
  };

  cursorToEnd = () => {
    const input = ReactDOM.findDOMNode(this.refs.input);
    input.selectionStart = (input.selectionEnd = input.value.length);
    return this;
  }; // support chaining

  focus = () => {
    __guard__(ReactDOM.findDOMNode(this.refs.input), x => x.focus());
    return this;
  }; // support chaining

  // The label has style "pointer-events: none" set.  Unfortunantly IE 10
  // doesn't support that and refuses to pass the click through the label into the input
  // We help it out here by manually focusing when then label is clicked
  // (which should only happen on IE 10)
  forwardLabelClick = () => { return this.focus(); };

  validate = (inputValue) => {
    let errors = this.props.validate(inputValue);
    if (errors == null) { errors = []; }
    return this.setState({ errors });
  };

  render() {
    let inputBox, props;
    const { children } = this.props;

    const classes = classnames('form-control', this.props.class,
      { empty: !(this.props.hasValue || this.props.default || this.props.defaultValue || this.props.value) });

    const wrapperClasses = classnames(
      'form-control-wrapper',
      'tutor-input',
      this.props.className,
      {
        'is-required': this.props.required,
        'has-error': (this.state.errors != null ? this.state.errors.length : undefined),
      },
    );

    const errors = map(this.state.errors, function(error) {
      if (TutorErrors[error] == null) { return; }
      const ErrorWarning = TutorErrors[error];
      return <ErrorWarning key={error} />;
    });

    let inputProps = {
      ref: 'input',
      className: classes,
      onChange: this.onChange,
    };

    if (this.props.default != null) { if (inputProps.defaultValue == null) { inputProps.defaultValue = this.props.default; } }

    if (children != null) {
      inputBox = React.cloneElement(children, inputProps);
    } else {
      props = omit(this.props, 'autoFocus', 'label', 'className', 'onChange', 'validate', 'default', 'children', 'ref', 'hasValue');
      inputProps = extend({}, inputProps, props);

      inputBox = <input {...inputProps} />;
    }


    // Please do not set value={@props.value} on input.
    //
    // Because we are updating the store in some cases on change, and
    // the store is providing the @props.value being passed in here,
    // the cursor for typing in this input could be forced to move to the
    // right when the input re-renders since the props have changed.
    //
    // Instead, use @props.default to set an intial defaul value.
    return (
      <div className={wrapperClasses}>
        {inputBox}
        <div className="floating-label" onClick={this.forwardLabelClick}>
          {this.props.label}
        </div>
        {errors}
      </div>
    );
  }
}

class TutorDateInput extends React.Component {
  static defaultProps = function() {
    const currentLocale = TimeHelper.getCurrentLocales();
    return { currentLocale };
  }();

  static propTypes = {
    currentLocale: PropTypes.shape({
      abbr: PropTypes.string,
      week: PropTypes.object,
      weekdaysMin: PropTypes.array,
    }),
  };

  state = { expandCalendar: false };

  // For some reason, react-datepicker chooses to GLOBALLY override moment's locale.
  // This tends to do nasty things to the dashboard calendar.
  // Therefore, grab the current locale settings, and restore them when unmounting.
  // TODO: debug react-datepicker and submit a PR so that it will no longer thrash moment's global.
  componentWillUnmount() {
    return this.restoreLocales();
  }

  onBlur = () => {
    return this.setState({ hasFocus: false });
  };

  getValue = () => {
    return this.props.value || this.state.value;
  };

  dateSelected = (value) => {
    let errors;
    const valid = this.isValid(value);

    if (!valid) {
      value = TimeHelper.getMomentPreserveDate(this.props.min) || null;
      errors = ['Invalid date'];
    }


    value = TimeHelper.getMomentPreserveDate(value);

    this.props.onChange(value);
    return this.setState({ expandCalendar: false, valid, value, errors });
  };

  expandCalendar = () => {
    return this.setState({ expandCalendar: true, hasFocus: true });
  };

  isValid = (value) => {
    if (!moment.isMoment(value)) { value = moment(value); }
    let valid = true;
    if (this.props.min && value.isBefore(this.props.min, 'day')) { valid = false; }
    if (this.props.max && value.isAfter(this.props.max, 'day')) { valid = false; }
    return valid;
  };

  restoreLocales = () => {
    const { abbr } = this.props.currentLocale;

    const localeOptions = omit(this.props.currentLocale, 'abbr');
    return moment.locale(abbr, localeOptions);
  };

  render() {
    let dateElem, displayValue;
    const classes = classnames('form-control',
      { empty: !(this.props.value || this.props.default || this.state.hasFocus) });

    const wrapperClasses = classnames(
      'form-control-wrapper',
      'tutor-input',
      '-tutor-date-input',
      this.props.className,
      {
        'is-required': this.props.required,
        'has-error': (this.state.errors != null ? this.state.errors.length : undefined),
        'disabled-datepicker':  isDatePickerDisabled,
      },
    );

    const now = TimeStore.getNow();
    let { value } = this.props;

    value = value ?
      TimeHelper.getMomentPreserveDate(value).toDate() : null;

    var isDatePickerDisabled = this.props.disabled && value;
    const min = this.props.min ? moment(this.props.min) : moment(now).subtract(10, 'years');
    const max = this.props.max ? moment(this.props.max) : moment(now).add(10, 'years');

    if (!this.props.disabled) {
      dateElem = (
        <DatePicker
          minDate={min.toDate()}
          maxDate={max.toDate()}
          onFocus={this.expandCalendar}
          onBlur={this.onBlur}
          key={this.props.id}
          ref="picker"
          className={classes}
          onChange={this.dateSelected}
          disabled={this.props.disabled}
          selected={value}
          weekStart={`${this.props.currentLocale.week.dow}`} />
      );
    } else if (isDatePickerDisabled) {
      displayValue = value ? moment(value).format(TutorDateFormat) : '';
    }

    const displayOnlyProps = {
      type: 'text',
      disabled: true,
      readOnly: true,
      className: classes,
      value: displayValue || '',
    };

    return (
      <div className={wrapperClasses}>
        <input {...displayOnlyProps} />
        <div className="floating-label">
          {this.props.label}
        </div>
        <div className="hint required-hint">
          Required field
        </div>
        <div className="date-wrapper">
          {dateElem}
          <Icon type="calendar" />
        </div>
      </div>
    );
  }
}

class TutorTimeInput extends React.Component {
  static defaultProps = {
    fromMomentFormat: TimeHelper.ISO_TIME_FORMAT,
    toMomentFormat: TimeHelper.HUMAN_TIME_FORMAT,

    formatCharacters: {
      i: {
        validate(char) { return /([0-2]|:)/.test(char); },
      },

      h: {
        validate(char) { return /[0-9]/.test(char); },
      },

      H: {
        validate(char) { return /[0-1]/.test(char); },
      },

      M: {
        validate(char) { return /[0-5]/.test(char); },
      },

      m: {
        validate(char) { return /[0-9]/.test(char); },
      },

      P: {
        validate(char) { return /(A|P|a|p)/.test(char); },
        transform(char) { return `${char}m`.toLowerCase(); },
      },
    },
  };

  constructor(props, context) {
    super(props, context);
    const { defaultValue } = props;
    const timeValue = this.timeIn(defaultValue);

    this.state = {
      timeValue,
      initialTimeValue: timeValue,
      timePattern: this.getPatternFromValue(timeValue),
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.timeValue !== prevState.timeValue) { __guard__(this.getMask(), x => x.setValue(this.state.timeValue)); }
    if ((this.state.selection != null) && !isEqual(__guard__(this.getMask(), x1 => x1.selection), this.state.selection)) {
      // update cursor to expected time, doesnt quite work for some reason for expanding mask
      defer(() => {
        __guard__(this.getMask(), x2 => x2.setSelection(this.state.selection));
        return __guard__(this.getInput(), x3 => x3._updateInputSelection());
      });
    }

    return this.refs.timeInput.validate(this.state.timeValue);
  }

  onChange = (value, input, changeEvent) => {
    const timePattern = this.getPatternFromValue(value, changeEvent);
    const time = this.getValue();

    let { timeValue, selection } = this.getUpdates(timePattern, time);
    const nextState =
      { selection: undefined };
    if (timePattern !== this.state.timePattern) { nextState.timePattern = timePattern; }
    if (timeValue !== this.state.timeValue) { nextState.timeValue = timeValue; }
    if (!isEqual(this.getMask().selection, selection)) { nextState.selection = selection; }

    this.setState(nextState);

    if (this.isValidTime(timeValue)) {
      timeValue = this.timeOut(timeValue);
    }

    return (typeof this.props.onChange === 'function' ? this.props.onChange(timeValue) : undefined);
  };

  getInput = () => {
    return (this.refs.timeInput != null ? this.refs.timeInput.refs.input : undefined);
  };

  getMask = () => {
    return __guard__(this.getInput(), x => x.mask);
  };

  getPatternFromValue = (value, changeEvent) => {
    let pattern;
    if (/^([2-9])/.test(value) || /^(_+[1-9])/.test(value)) {
      let patten;
      return patten = 'h:Mm P';
    } else if (/^1:/.test(value)) {
      if ((changeEvent != null) && !this.shouldShrinkMask(changeEvent)) {
        return pattern = 'hh:Mm P';
      } else {
        return pattern = 'h:Mm P';
      }
    } else {
      return pattern = 'hi:Mm P';
    }
  };

  getRawValue = () => {
    return __guard__(this.getMask(), x => x.getRawValue());
  };

  getUpdates = (timePattern, timeValue) => {
    const cursorChange =  timePattern.length - this.state.timePattern.length;
    let { selection } = this.getMask();
    selection = clone(selection);

    if (/^(_+[1-9])/.test(timeValue)) {
      timeValue = S.removeAt(timeValue, 0);
      selection.start = 2;
      selection.end = 2;

    } else if (cursorChange > 0) {
      timeValue = S.insertAt(timeValue, 1, __guard__(this.getMask(), x => x.placeholderChar));
      selection.start = 1;
      selection.end = 1;

    } else if (cursorChange < 0) {
      timeValue = S.removeAt(timeValue, 1);
      selection.start = 2;
      selection.end = 2;
    }

    return { timeValue, selection };
  };

  getValue = () => {
    return __guard__(this.getMask(), x => x.getValue());
  };

  isColon = (changeEvent) => {
    const KEY_CODE = {
      shiftKey: true,
      charCode: 58,
    };

    return isEqual(pick(changeEvent, keys(KEY_CODE)), KEY_CODE);
  };

  isCursor = () => {
    const { selection } = this.getMask();
    return (selection.end - selection.start) === 0;
  };

  isValidTime = (value) => {
    return !/_/.test(value);
  };

  shouldShrinkMask = (changeEvent) => {
    return this.isColon(changeEvent);
  };

  timeIn = (value) => {
    const { fromMomentFormat, toMomentFormat } = this.props;
    return moment(value, fromMomentFormat).format(toMomentFormat);
  };

  timeOut = (value) => {
    const { fromMomentFormat, toMomentFormat } = this.props;
    return moment(value, toMomentFormat).format(fromMomentFormat);
  };

  validate = (inputValue) => {
    if (!isUndefined(inputValue)) {
      if (inputValue.indexOf(__guard__(this.getMask(), x => x.placeholderChar)) > -1) { return ['incorrectTime']; }
    }
  };

  render() {
    const maskedProps = omit(this.props, 'defaultValue', 'onChange', 'formatCharacters');
    const inputProps = pick(this.props, 'disabled');

    const { formatCharacters } = this.props;
    const { timePattern, timeValue } = this.state;
    return (
      <TutorInput
        {...maskedProps}
        onChange={this.onChange}
        validate={this.validate}
        hasValue={!!timeValue}
        ref="timeInput">
        <MaskedInput
          {...inputProps}
          value={timeValue}
          name="time"
          size="8"
          mask={timePattern}
          formatCharacters={formatCharacters} />
      </TutorInput>
    );
  }
}

class TutorTextArea extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
  };

  componentDidMount() {
    if ((this.props.default != null ? this.props.default.length : undefined) > 0) { return this.resize(); }
  }

  onChange = (event) => {
    return this.props.onChange(event.target != null ? event.target.value : undefined, event.target);
  };

  focus = () => {
    return __guard__(ReactDOM.findDOMNode(this.refs.textarea), x => x.focus());
  };

  // Forward clicks on for IE10.  see comments on TutorInput
  forwardLabelClick = () => { return this.focus(); };

  resize = (event) => {
    return this.refs.textarea.style.height = `${this.refs.textarea.scrollHeight}px`;
  };

  render() {
    const classes = classnames('form-control', this.props.inputClass,
      { empty: !this.props.default });

    const wrapperClasses = classnames('form-control-wrapper', 'tutor-input', this.props.className,
      { 'is-required': this.props.required });

    return (
      <div className={wrapperClasses}>
        <textarea
          id={this.props.inputId}
          ref="textarea"
          type="text"
          onKeyUp={this.resize}
          onPaste={this.resize}
          className={classes}
          defaultValue={this.props.default}
          disabled={this.props.disabled}
          onChange={this.onChange} />
        <div className="floating-label" onClick={this.forwardLabelClick}>
          {this.props.label}
        </div>
        <div className="hint required-hint">
          {'\
    Required field\
    '}
        </div>
      </div>
    );
  }
}

// TODO: replace with new and improved BS.Radio when we update
class TutorRadio extends React.Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
  };

  handleChange = (changeEvent) => {
    const { value } = this.props;

    return (typeof this.props.onChange === 'function' ? this.props.onChange(changeEvent, { value }) : undefined);
  };

  isChecked = () => {
    return this.refs.radio.checked;
  };

  render() {
    let { label, className, value, id, checked } = this.props;
    const inputProps = pick(this.props, 'value', 'id', 'name', 'checked', 'disabled');

    if (label == null) { label = value; }
    const classes = classnames('tutor-radio', className,
      { active: checked });

    return (
      <div className={classes}>
        <input ref="radio" {...inputProps} type="radio" onChange={this.handleChange} />
        {' '}
        <label htmlFor={id}>
          {label}
        </label>
      </div>
    );
  }
}

export { TutorInput, TutorDateInput, TutorDateFormat, TutorTimeInput, TutorTextArea, TutorRadio };

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
