import React from 'react';
import {
  View,
  PanResponder,
  Animated,
  StyleSheet
} from 'react-native';

import _ from 'lodash';
import Board from './Board';

const BLOCK_NUM = 5;

function CircularArray(array) {
  let arr = array || [];
  let top = 0;
  let bottom = arr.length && arr.length - 1;
  let cycleCallbackTop;
  let cycleCallbackBottom;

  this.setOnCycleCallback = function setOnCycleCallbacks(topCallback, bottomCallback) {
    cycleCallbackTop = topCallback;
    cycleCallbackBottom = bottomCallback;
  };

  this.getTop = function getTop() {
    let elem = arr[top];
    bottom = top++;
    if (top >= arr.length) {
      top = 0;
      if (cycleCallbackTop) { cycleCallbackTop(elem); }
    }
    return elem;
  };

  this.getBottom = function getBottom() {
    let elem = arr[bottom];
    top = bottom--;
    if (bottom < 0) {
      bottom = arr.length - 1;
      if (cycleCallbackBottom) { cycleCallbackBottom(elem); }
    }
    return elem;
  };

  this.setBottom = function setBottom(element) {
    let oldBottom = arr[bottom];
    arr[bottom] = element;
    return oldBottom;
  };

  this.setTop = function setTop(element) {
    let oldTop = arr[top];
    arr[top] = element;
    return oldTop;
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
  _previousTouchDY: 0,
  _previousOffset: 0,
  _boardHeight: 0,
  _height: 0,
  _styles: {},
  _animation: null,
  _targetView: 0,
  _touches: [],
  _rows: [],
  _blocks: new CircularArray(),
  _textBlocks: new CircularArray(),
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
    //console.log('will mount');

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd
    });

    this._styles.style = {
      transform: [{translateY: this._previousTouchDY}]
    };

    this._resultTextMat = new Array(this.props.colsNumber);
    for (let i = 0; i < this._resultTextMat.length; i++) {
      this._resultTextMat[i] = new Array(this.props.rowsNumber);
    }
  },

  /* eslint-disable no-undef */
  componentDidMount() {
    //console.log('did mount');
    const self = this;
    requestAnimationFrame(function onRenderFrame() {
      if (self._isFling) {
        self._rollBy(self._velocity);
        self._velocity *= 0.99;
        if (Math.abs(self._velocity) < 1) { self._flingStop(); }
      }
      requestAnimationFrame(onRenderFrame);
    });
    this._blocks.setOnCycleCallback(this._onCycleTop, this._onCycleBottom);
  },

  _onCycleTop() {
    let textBlock = this._textBlocks.getTop();
    textBlock.offset += this._blockHeight * (BLOCK_NUM + textBlock.posIndex);
    this._blocks.setTop(textBlock);
  },

  _onCycleBottom() {
    let textBlock = this._textBlocks.getTop();
    textBlock.offset += this._blockHeight * (BLOCK_NUM + textBlock.posIndex);
    this._blocks.setTop(textBlock);
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
    this._previousTouchDY = 0;
  },

  _handlePanResponderMove(e, gestureState) {
    this._touches.push(_.assign({}, gestureState, {timestamp: Date.now()}));
    //this.state.offset.setValue(this._previousTouchDY + gestureState.dy);
    this._rollBy(-(this._previousTouchDY - gestureState.dy));
    this._previousTouchDY = gestureState.dy;
    //this._styles.style.transform[0].translateY = this._previousTouchDY + gestureState.dy;
    //this._updateNativeStyles();
  },

  _handlePanResponderEnd() {
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
    if (!this._blockHeight) { throw new Error('Block height is not initialized!'); }
    this._layout = true;
    this._height = event.nativeEvent.layout.height;
    this._upperRollThreshold = 0;
    this._bottomRollThreshold = -this._blockHeight;
    //this._rollTo(3000);
  },

  _onBlockLayout(event) {
    if (!this._blockHeight) {
      this._blockHeight = event.nativeEvent.layout.height;
    } else if (this._blockHeight !== event.nativeEvent.layout.height) {
      throw new Error('Blocks have different heights!');
    }
  },

  _rollBy(offset) {
    this._rollTo(this._previousOffset + offset);
  },

  _rollTo(offset) {
    if (offset > this._upperRollThreshold) {
      const dy = offset - this._upperRollThreshold;
      const boardsNum = Math.ceil(dy / this._blockHeight);
      this._rollUp(boardsNum);
    }
    else if (offset < this._bottomRollThreshold) {
      const dy = this._bottomRollThreshold - offset;
      const boardsNum = Math.ceil(dy / this._blockHeight);
      this._rollDown(boardsNum);
    }
    for (var i = 0; i < this._blocks.getLength(); i++) {
      this._blocks.get(i).component.translateY(offset + this._blocks.get(i).offset);
    }
    this._previousOffset = offset;
  },

  _rollUp(boardsNum) {
    // console.log('rollUp');
    for (let i = 0; i < boardsNum; i++) {
      let bottomBlock = this._blocks.getBottom();
      bottomBlock.offset -= this._blockHeight * BLOCK_NUM;
    }
    this._upperRollThreshold += this._blockHeight * boardsNum;
    this._bottomRollThreshold += this._blockHeight * boardsNum;
  },

  _rollDown(boardsNum) {
    // console.log('rollDown');
    for (let i = 0; i < boardsNum; i++) {
      let topBlock = this._blocks.getTop();
      topBlock.offset += this._blockHeight * BLOCK_NUM;
    }
    this._upperRollThreshold -= this._blockHeight * boardsNum;
    this._bottomRollThreshold -= this._blockHeight * boardsNum;
  },

  renderBlocks() {
    let blocks = [];
    for (let i = 0; i < BLOCK_NUM; i++) {
      blocks.push(<Board key={i} onLayout={this._onBlockLayout} ref={component => this._blocks.push({component, offset: 0})}/>);
    }
    for (let i = 0; i < this.props.text.length; i++) {
      blocks.push(<Board key={blocks.length} text={this.props.text[i]} onLayout={this._onBlockLayout} ref={component => this._textBlocks.push({component, offset: 0, posIndex: i})}/>);
    }
    return blocks;
  },

  //style={{transform: [{translateY: this.state.offset}], overflow: 'hidden'}}
  render() {
    console.log('render');
    //removeClippedSubviews={true}
    return (
      <View
        style={styles.container}
        {...this._panResponder.panHandlers}
      >
        <View
          style={styles.container}
          onLayout={this._onLayout}
          ref={component => this._root = component} //eslint-disable-line no-return-assign
          >
          {this.renderBlocks()}
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
