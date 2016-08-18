import React from 'react';
import {
  View,
  PanResponder
} from 'react-native';

const PanView = React.createClass({
  propTypes: {

  },
  _previousOffset: 0,
  _height: 0,
  _styles: {},

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

      backgroundColor: 'yellow',
      position: 'absolute',
      left: 0,
      right: 0,
      top: this._previousOffset,
      bottom: -this._previousOffset
    };
  },

  componentDidMount() {
    this._updateNativeStyles();
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

  // _handlePanResponderGrant(e, gestureState: Object) {
  // this._highlight();
  // },

  _handlePanResponderMove(e, gestureState) {
    this._styles.style.top = this._previousOffset + gestureState.dy;
    this._styles.style.bottom = -this._styles.style.top;
    this._updateNativeStyles();
  },

  _handlePanResponderEnd(e, gestureState) {
    this._previousOffset += gestureState.dy;
  },

  _onLayout(event) {
    this._height = event.nativeEvent.layout.height;
  },

  render() {
    return (
      <View
        onLayout={this._onLayout}
        {...this._panResponder.panHandlers}
        ref={component => this._root = component} //eslint-disable-line no-return-assign
        >
          {this.props.children}
      </View>
    );
  }
});

export default PanView;
