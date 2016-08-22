import React from 'react';
import {
  View,
  PanResponder,
  Animated
} from 'react-native';

import _ from 'lodash';

const PanView = React.createClass({
  propTypes: {

  },
  _previousOffset: 0,
  _height: 0,
  _styles: {},
  _animation: null,

  getInitialState() {
    return {
      offset: new Animated.Value(0),
      currentView: new Animated.Value(0)
    };
  },

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd
    });

    this._styles.style = {
      transform: [{translateY: this._previousOffset}],
      overflow: 'hidden'
    };
  },

  componentDidMount() {
    //this._updateNativeStyles();
  },

  _updateNativeStyles() {
    this._root.setNativeProps(this._styles);
  },

  _handleStartShouldSetPanResponder() {
    return true;
  },

  _handleMoveShouldSetPanResponder() {
    return true;
  },

  _handlePanResponderGrant() {
    if (this._animation) {
      this._animation.stop();
      this._previousOffset = this.state.offset.__getValue();
    }
  },

  _handlePanResponderMove(e, gestureState) {
    this.state.offset.setValue(this._previousOffset + gestureState.dy);
    //this._styles.style.transform[0].translateY = this._previousOffset + gestureState.dy;
    //this._updateNativeStyles();
  },

  _handlePanResponderEnd() {
    let animationTargetView = Math.round(-this.state.offset.__getValue() / this._height);
    animationTargetView = _.clamp(animationTargetView, 0, this.props.children.length - 1);
    const animationTargetOffset = -animationTargetView * this._height;

    this._previousOffset = animationTargetOffset;
    //this._previousOffset += gestureState.dy;
    this._animation = Animated.spring(
      this.state.offset,
      {toValue: animationTargetOffset}
    );
    this._animation.start();
  },

  _onLayout(event) {
    this._height = event.nativeEvent.layout.height / this.props.children.length;
  },

  render() {
    //console.log('render');
    return (
      <Animated.View
        removeClippedSubviews={true}
        onLayout={this._onLayout}
        {...this._panResponder.panHandlers}
        style={{transform: [{translateY: this.state.offset}]}}
        ref={component => this._root = component} //eslint-disable-line no-return-assign
        >
          {this.props.children}
      </Animated.View>
    );
  }
});

export default PanView;
