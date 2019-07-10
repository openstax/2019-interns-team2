import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import { compact, map, partial, extend, clone } from 'underscore';

class TutorPopover extends React.Component {
  static defaultProps = {
    maxHeightMultiplier: 0.75,
    maxWidthMultiplier: 0.75,
    windowImpl: window,
  };

  static displayName = 'TutorPopover';

  static propTypes() {
    return {
      content: PropTypes.node.isRequired,
      popoverProps: PropTypes.object,
      contentProps: PropTypes.object,
      overlayProps: PropTypes.object,
      windowImpl: PropTypes.object,
      maxHeightMultiplier: PropTypes.number,
      maxWidthMultiplier: PropTypes.number,
    };
  }

  state = {
    firstShow: true,
    placement: 'auto',
    show: false,
    scrollable: false,
    imagesLoading: [],
  };

  getImages = () => {
    const content = this.refs.popcontent;
    return content.querySelectorAll('img');
  };

  areImagesLoading = () => {
    return compact(this.state.imagesLoading).length !== 0;
  };

  hide = () => {
    this.setState({ show: false });
    return this.refs.popper.hide();
  };

  imageLoaded = (iter) => {
    const { imagesLoading } = this.state;

    const currentImageStatus = clone(imagesLoading);
    currentImageStatus[iter] = false;

    return this.setState({ imagesLoading: currentImageStatus });
  };

  show = () => {
    this.setState({ show: true });
    return this.refs.popper.show();
  };


  render() {
    let contentClassName;
    let { children, content, popoverProps, overlayProps, id } = this.props;
    const { scrollable, placement, delayShow } = this.state;

    if (scrollable) {
      popoverProps = clone(popoverProps || {});
      if (popoverProps.className == null) { popoverProps.className = ''; }
      popoverProps.className += ' scrollable';
    }

    if (this.areImagesLoading()) {
      contentClassName = 'image-loading';
    }

    content = React.cloneElement(content, { className: contentClassName });
    const popoverId = `tutor-popover-${id || 'unknown'}`;

    const popover = (
      <Popover {...popoverProps} id={popoverId} ref={this.setPopoverRef}>
        <div ref="popcontent">
          {content}
        </div>
      </Popover>
    );

    return (
      <OverlayTrigger {...overlayProps} placement={placement} overlay={popover} ref="popper">
        {children}
      </OverlayTrigger>
    );
  }
}

export default TutorPopover;
