import PropTypes from 'prop-types';
import React from 'react';
import { first, partial, findIndex } from 'lodash';
import { observer } from 'mobx-react';
import { observable, computed, action } from 'mobx';
import ScrollTo from '../../helpers/scroll-to';

import { ExercisePreview } from 'shared';
import PagingNavigation from '../paging-navigation';
import NoExercisesFound from './no-exercises-found';
import { Icon } from 'shared';
import { ExercisesMap } from '../../models/exercises';
import Book from '../../models/reference-book';

@observer
class ExerciseDetails extends React.Component {
  static displayName = 'ExerciseDetails';

  static propTypes = {
    book:                  PropTypes.instanceOf(Book).isRequired,
    exercises:             PropTypes.instanceOf(ExercisesMap).isRequired,
    selectedExercise:      PropTypes.object.isRequired,
    onExerciseToggle:      PropTypes.func.isRequired,
    onShowCardViewClick:   PropTypes.func.isRequired,
    getExerciseActions:    PropTypes.func.isRequired,
    getExerciseIsSelected: PropTypes.func.isRequired,
    selectedSection:       PropTypes.string,
    displayFeedback:       PropTypes.bool,
    onSectionChange:       PropTypes.func,
    topScrollOffset:       PropTypes.number,
    windowImpl:            PropTypes.object,
  };

  static defaultProps = {
    topScrollOffset: 40,
  };

  scroller = new ScrollTo({
    windowImpl: this.props.windowImpl,
    onAfterScroll: this.onAfterScroll,
  });

  @observable currentIndex;
  @observable currentSection;

  @computed get exercises() {
    return this.props.exercises.array;
  }

  componentDidMount() {
    // this.scroller.scrollToSelector('.exercise-controls-bar');
  }

  componentWillMount() {
    const { selectedExercise } = this.props;
    if (selectedExercise) {
      this.currentIndex = findIndex(this.exercises, selectedExercise);
      if (-1 == this.currentIndex) this.currentIndex = 0;
      this.currentSection = selectedExercise.page.chapter_section.asString;
    }
  }

  @action.bound onPrev() { this.moveTo(this.currentIndex - 1); }
  @action.bound onNext() { this.moveTo(this.currentIndex + 1); }

  @action.bound moveTo(index) {
    this.currentIndex = index;
    const exercise = this.exercises[index];
    const section = exercise.page.chapter_section.asString;
    if (this.currentSection !== section) {
      this.currentSection = section;
      if (this.props.onSectionChange) {
        this.props.onSectionChange(this.currentSection);
      }
    }
  }

  getValidMovements = () => {
    return {
      prev: this.currentIndex !== 0,
      next: this.currentIndex !== (this.exercises.length - 1),
    };
  };

  render() {
    const exercise = this.exercises[this.currentIndex] || first(this.exercises);
    if (!exercise) {
      return (
        <NoExercisesFound />
      );
    }
    const moves = this.getValidMovements();
    return (
      <div className="exercise-details">
        <div className="controls">
          <a
            className="show-cards"
            onClick={partial(this.props.onShowCardViewClick, partial.placeholder, exercise)}
          >
            <Icon type="th" size="lg" /> Back to Card View
          </a>
        </div>

        <PagingNavigation
          isForwardEnabled={moves.next}
          isBackwardEnabled={moves.prev}
          onForwardNavigation={this.onNext}
          onBackwardNavigation={this.onPrev}
          scrollOnNavigation={false}
        >
          <div className="exercise-content">
            <ExercisePreview
              className="exercise-card"
              isVerticallyTruncated={false}
              isSelected={this.props.getExerciseIsSelected(exercise)}
              overlayActions={this.props.getExerciseActions(exercise)}
              displayFeedback={this.props.displayFeedback}
              extractedInfo={exercise}
              exercise={exercise.content}
              actionsOnSide={true}
            />
          </div>
        </PagingNavigation>

      </div>
    );
  }
}

export default ExerciseDetails;
