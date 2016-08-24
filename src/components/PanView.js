import React from 'react';
import {
  View,
  PanResponder,
  Animated,
  StyleSheet
} from 'react-native';

import _ from 'lodash';
import TextRow from './TextRow';

const BLOCK_NUM = 5;

function CircularArray(array) {
  let arr = array || [];
  let top = 0;
  let bottom = arr.length && arr.length - 1;

  this.getTop = function getTop() {
    let elem = arr[top];
    bottom = top++;
    if (top >= arr.length) { top = 0; }
    return elem;
  };

  this.getBottom = function getBottom() {
    let elem = arr[bottom];
    top = bottom--;
    if (bottom < 0) { bottom = arr.length - 1; }
    return elem;
  };

  this.push = function push(elem) {
    arr.push(elem);
    top = 0;
    bottom = arr.length - 1;
  };

  this.get = function get(index) {
    return arr[index];
  };

  this.getLength = function getLength() {
    return arr.length;
  };
}

const PanView = React.createClass({
  propTypes: {
    debug: React.PropTypes.bool
  },
  _previousOffset: 0,
  _boardHeight: 0,
  _height: 0,
  _styles: {},
  _animation: null,
  _targetView: 0,
  _touches: [],
  _rows: [],
  _blocks: new CircularArray(),
  _upperRollThreshold: 0,
  _bottomRollThreshold: 0,
  _isFling: false,
  _velocity: 0,
  _layout: false,

  getDefaultProps() {
    return {
      rowsNumber: 35,
      text: 'Hello, World!',
      debug: false
    };
  },

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
      transform: [{translateY: this._previousOffset}]
    };

    this._resultTextMat = new Array(this.props.colsNumber);
    for (let i = 0; i < this._resultTextMat.length; i++) {
      this._resultTextMat[i] = new Array(this.props.rowsNumber);
    }
  },

  /* eslint-disable no-undef */
  componentDidMount() {
    const self = this;
    requestAnimationFrame(function onRenderFrame() {
      if (self._isFling) {
        self._rollBy(self._velocity);
        self._velocity *= 0.99;
        if (Math.abs(self._velocity) < 1) { self._flingStop(); }
      }
      requestAnimationFrame(onRenderFrame);
    });
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
    this._flingStop();
    // if (this._animation) {
    //   this._animation.stop();
    //   this._previousOffset = this.state.offset.__getValue();
    // }
  },

  _handlePanResponderMove(e, gestureState) {
    this._touches.push(_.assign({}, gestureState, {timestamp: Date.now()}));
    //this.state.offset.setValue(this._previousOffset + gestureState.dy);
    this._rollTo(this._previousOffset + gestureState.dy);
    //this._styles.style.transform[0].translateY = this._previousOffset + gestureState.dy;
    //this._updateNativeStyles();
  },

  _handlePanResponderEnd(e, gestureState) {
    this._previousOffset += gestureState.dy;

    if (this._touches.length > 2) {
      let lastTouches = this._touches.slice(-5);
      let dy = lastTouches[lastTouches.length - 1].moveY - lastTouches[0].moveY;
      let dTime = lastTouches[lastTouches.length - 1].timestamp - lastTouches[0].timestamp;
      this._velocity = dy / (dTime ? dTime : 1) * 10;
      this._touches = [];
    }

    this._flingStart();
  },

  _flingStart() {
    this._isFling = true;
  },

  _flingStop() {
    this._velocity = 0;
    this._isFling = false;
  },

  _onLayout(event) {
    if (this._layout) { return; }
    this._layout = true;
    console.log('onLayout');
    this._height = event.nativeEvent.layout.height;
    this._blockHeight = this._height / BLOCK_NUM;
    this._upperRollThreshold = 0;
    this._bottomRollThreshold = -this._blockHeight;
  },

  _rollBy(offset) {
    this._previousOffset += offset;
    this._rollTo(this._previousOffset);
  },

  _rollTo(offset) {
    for (var i = 0; i < this._blocks.getLength(); i++) {
      const style = {transform: [{translateY: offset + this._blocks.get(i).offset}]};
      this._blocks.get(i).component.setNativeProps({style});
    }
    if (offset > this._upperRollThreshold) { this._rollUp(); }
    else if (offset < this._bottomRollThreshold) { this._rollDown(); }
  },

  _rollUp() {
    let bottomBlock = this._blocks.getBottom();
    bottomBlock.offset -= this._height;
    this._upperRollThreshold += this._blockHeight;
    this._bottomRollThreshold += this._blockHeight;
  },

  _rollDown() {
    let topBlock = this._blocks.getTop();
    topBlock.offset += this._height;
    this._upperRollThreshold -= this._blockHeight;
    this._bottomRollThreshold -= this._blockHeight;
  },

  renderRows() {
    let blocks = [];
    for (var i = 0; i < BLOCK_NUM; i++) {
      let rows = [];
      for (var j = 0; j < this.props.rowsNumber / BLOCK_NUM; j++) {
        rows.push(<TextRow key={j} ref={component => this._rows.push(component)}/>);
      }
      blocks.push(<View key={i} ref={component => this._blocks.push({component, offset: 0})}>{rows}</View>);
    }
    return blocks;
  },

  //style={{transform: [{translateY: this.state.offset}], overflow: 'hidden'}}
  render() {
    //console.log('render');
    //removeClippedSubviews={true}
    return (
      <View
        style={styles.container}
        {...this._panResponder.panHandlers}
      >
        <View
          onLayout={this._onLayout}
          ref={component => this._root = component} //eslint-disable-line no-return-assign
          >
          {this.renderRows()}
        </View>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden'
  },
  charContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'visible'
  },
  char: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  charText: {
    color: 'black',
    textAlign: 'center'
  },
  randomCharText: {
    color: '#e6e6cb',
    textAlign: 'center'
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'

  },
  col: {
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
});

export default PanView;
