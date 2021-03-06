import PropTypes from 'prop-types';
import React from 'react';
import { ListGroup } from 'react-bootstrap';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { readonly } from 'core-decorators';
import { ReactHelpers } from 'shared';
import { Icon } from 'shared';
import Theme from '../theme';

@observer
class Choice extends React.Component {

  static propTypes = {
    onClick:    PropTypes.func.isRequired,
    className:  PropTypes.string,
    children:   PropTypes.node,
    active:     PropTypes.bool,
    disabled:   PropTypes.bool,
    record:     PropTypes.any,
  }

  @action.bound
  onClick(ev) {
    this.props.onClick(this.props.record, ev);
  }

  render() {
    const { active } = this.props;

    return (
      <div
        role="button"
        aria-pressed={this.props.active}
        {...ReactHelpers.filterProps(this.props)}
        className={classnames('list-group-item', 'choice', this.props.className, {
          active: active, disabled: this.props.disabled,
        })}
        onClick={this.onClick}
      >
        <div className="content">
          {this.props.children}
        </div>
        <Icon
          color={active ? Theme.colors.states.correct : Theme.colors.neutral.gray}
          type={active ? 'check-circle' : 'circle'}
        />
      </div>
    );
  }
}

@observer
class Listing extends React.Component {

  @readonly static Choice = Choice;

  render() {
    return (
      <ListGroup className="choices-listing">
        {this.props.children}
      </ListGroup>
    );
  }

}

export { Choice, Listing };
