import moment from 'moment-timezone';
import { TimeStore } from '../flux/time';
import PropTypes from 'prop-types';
import React from 'react';

export default class Time extends React.Component {
  static defaultProps = {
    format: 'short',
    date: TimeStore.getNow(),
  };

  static propTypes = {
    date: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]).isRequired,

    format: PropTypes.string,
  };

  render() {
    let { format, date } = this.props;
    format = (() => { switch (this.props.format) {
    case 'shortest': return 'M/D'; // 9/14
    case 'short': return 'MMM DD, YYYY'; // Feb 14, 2010
    case 'concise': return 'dd MMM DD[,] h:mma';
    case 'long': return 'dddd, MMMM Do YYYY, h:mm:ss a'; // Sunday, February 14th 2010, 3:25:50 pm
    default: return this.props.format;
    } })();

    return (
      <time>
        {moment(date).format(format)}
      </time>
    );
  }
}
