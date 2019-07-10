import PropTypes from 'prop-types';
import React from 'react';
import { isEmpty, compact, map, pick } from 'lodash';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import AnswersTable from './answers-table';
import ArbitraryHtmlAndMath from '../html';
import FormatsListing from './formats-listing';
import QuestionModel, { ReviewQuestion } from '../../model/exercise/question';

@observer
class QuestionHtml extends React.Component {

  static propTypes = {
    html: PropTypes.string,
    type: PropTypes.string,
    questionNumber: PropTypes.number,
  };

  static defaultProps = {
    html: '',
    type: '',
  };

  static contextTypes = {
    processHtmlAndMath: PropTypes.func,
  };

  render() {
    const { questionNumber, html, type } = this.props;
    if (!(html.length > 0)) { return null; }

    const htmlAndMathProps = pick(this.context, 'processHtmlAndMath');

    return (
      <ArbitraryHtmlAndMath
        {...htmlAndMathProps}
        className={`question-${type}`}
        block={true}
        html={html}
        data-question-number={questionNumber} />
    );
  }

}


export default
@observer
class Question extends React.Component {

  static propTypes = {
    question: PropTypes.oneOfType([
      PropTypes.instanceOf(QuestionModel),
      PropTypes.instanceOf(ReviewQuestion),
    ]).isRequired,
    children: PropTypes.node,
    task: PropTypes.object,
    correct_answer_id: PropTypes.string,
    hideAnswers: PropTypes.bool,
    exercise_uid: PropTypes.string,
    displayFormats:  PropTypes.bool,
    processHtmlAndMath: PropTypes.bool,
    className: PropTypes.string,
    questionNumber: PropTypes.number,
    context: PropTypes.string,
  };

  static childContextTypes = {
    processHtmlAndMath: PropTypes.func,
  };

  getChildContext() {
    return (
      { processHtmlAndMath: this.props.processHtmlAndMath }
    );
  }

  doesArrayHaveProperty = (arrayToCheck, property) => {
    return (
      !isEmpty(compact(map(arrayToCheck, property)))
    );
  };

  hasAnswerCorrectness = () => {
    const { hideAnswers, correct_answer_id, question } = this.props;
    const { answers } = question;

    return (
      !hideAnswers && (correct_answer_id || this.doesArrayHaveProperty(answers, 'correctness'))
    );
  };

  hasSolution = () => {
    const { question, correct_answer_id } = this.props;
    const { collaborator_solutions } = question;

    return (
      this.doesArrayHaveProperty(collaborator_solutions, 'content_html')
    );
  };

  render() {
    let exerciseUid, solution;
    const { question, correct_answer_id, exercise_uid, className, questionNumber, context, task } = this.props;
    const { stem_html, collaborator_solutions, formats, stimulus_html } = question;

    const hasCorrectAnswer = !!correct_answer_id;
    const classes = classnames('openstax-question', className,
      { 'has-correct-answer': hasCorrectAnswer && !((task != null ? task.is_deleted : undefined) && ((task != null ? task.type : undefined) === 'homework')) });

    const htmlAndMathProps = pick(this.context, 'processHtmlAndMath');

    if (exercise_uid != null) { exerciseUid = <div className="exercise-uid">
      {exercise_uid}
    </div>; }

    if (this.hasSolution()) {
      solution =
        <div className="detailed-solution">
          <div className="header">
            Detailed solution
          </div>
          <ArbitraryHtmlAndMath
            {...htmlAndMathProps}
            className="solution"
            block={true}
            html={map(collaborator_solutions, 'content_html').join('')} />
        </div>;
    }

    return (

      <div className={classes} data-question-number={questionNumber}>
        <QuestionHtml type="context" html={context} />
        <QuestionHtml type="stimulus" html={stimulus_html} />
        <QuestionHtml type="stem" html={stem_html} questionNumber={questionNumber} />
        {this.props.children}
        <AnswersTable {...this.props} hasCorrectAnswer={hasCorrectAnswer} />
        {this.props.displayFormats ? <FormatsListing formats={formats} /> : undefined}
        {solution}
        {exerciseUid}
      </div>
    );
  }
}
