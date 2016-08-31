import React from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
  ActivityIndicator
  //Dimensions
} from 'react-native';

import _ from 'lodash';
import Board from './Board';

const BLOCK_NUM = 5;
//const SCREEN_HEIGHT = Dimensions.get('window').height;

function TextBlocksArray(array = []) {
  let pointer = array.length;
  let cycleCallbackTop;
  let cycleCallbackBottom;

  this.setOnCycleCallback = function setOnCycleCallbacks(topCallback, bottomCallback) {
    cycleCallbackTop = topCallback;
    cycleCallbackBottom = bottomCallback;
  };

  this.getTop = function getTop() {
    if (pointer + 1 < array.length) {
      pointer++;
    } else {
      pointer = 0;
    }
    if (pointer === 0 && cycleCallbackTop) { cycleCallbackTop(); }
    return array[pointer];
  };

  this.getBottom = function getBottom() {
    if (pointer - 1 >= 0) {
      pointer--;
    } else {
      pointer = array.length - 1;
    }
    if (pointer === 0 && cycleCallbackBottom) { cycleCallbackBottom(); }
    return array[pointer];
  };

  this.push = function push(elem) {
    array.push(elem);
    pointer = array.length;
  };

  this.get = function get(index) {
    return array[index];
  };

  this.replace = function set(index, newElem) {
    let oldElem = array[index];
    array[index] = newElem;
    return oldElem;
  };

  this.getLength = function getLength() {
    return array.length;
  };

  this.toString = function toString() {
    return array.toString();
  };
}

function CircularArray(array = []) {
  this.top = 0;
  this.cycles = 0;
  this.bottom = array.length && array.length - 1;
  this.cycleCallbackTop = null;
  this.cycleCallbackBottom = null;

  this.setOnCycleCallback = function setOnCycleCallbacks(topCallback, bottomCallback) {
    this.cycleCallbackTop = topCallback;
    this.cycleCallbackBottom = bottomCallback;
  };

  this.getTop = function getTop() {
    let elem = array[this.top];
    if (this.top === 0 && this.cycleCallbackTop) {
      this.cycles++;
      this.cycleCallbackTop();
    }
    this.bottom = this.top++;
    if (this.top >= array.length) {
      this.top = 0;
    }
    return elem;
  };

  this.getBottom = function getBottom() {
    let elem = array[this.bottom];
    if (this.bottom === 0 && this.cycleCallbackBottom) {
      this.cycles--;
      this.cycleCallbackBottom();
    }
    this.top = this.bottom--;
    if (this.bottom < 0) {
      this.bottom = array.length - 1;
    }
    return elem;
  };

  this.setBottom = function setBottom(element) {
    let oldBottom = array[this.bottom];
    array[this.bottom] = element;
    return oldBottom;
  };

  this.setTop = function setTop(element) {
    let oldTop = array[this.top];
    array[this.top] = element;
    return oldTop;
  };

  this.push = function push(elem) {
    array.push(elem);
    this.top = 0;
    this.bottom = array.length - 1;
  };

  this.get = function get(index) {
    return array[index];
  };

  this.replace = function set(index, newElem) {
    let oldElem = array[index];
    array[index] = newElem;
    return oldElem;
  };

  this.getLength = function getLength() {
    return array.length;
  };

  this.getCycles = function getCycles() {
    return this.cycles;
  };

  this.toString = function toString() {
    return array.toString();
  };
}

class PanView extends React.Component {

  _previousTouchDY = 0;
  _previousOffset = 0;
  _visibleHeight = 0;
  _fullHeight = 0;
  _centerOffset = 0;
  _touches = [];
  _blocks = new CircularArray();
  _textBlocks = new TextBlocksArray();
  _upperRollThreshold = 0;
  _bottomRollThreshold = 0;
  _isFling = false;
  _velocity = 0;
  _layout = false;
  _blockLayout = false;
  _animating = true;

  constructor(props) {
    super(props);
    this.state = {rendering: true};
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: this._handlePanResponderGrant.bind(this),
      onPanResponderMove: this._handlePanResponderMove.bind(this),
      onPanResponderRelease: this._handlePanResponderEnd.bind(this),
      onPanResponderTerminate: this._handlePanResponderEnd.bind(this)
    });
  }

  /* eslint-disable no-undef */
  componentDidMount() {
    this._blocks.setOnCycleCallback(this._onCycleTop.bind(this), this._onCycleBottom.bind(this));
    this._onRenderFrame(Date.now());
  }

  componentWillUnmount() {
    this._animating = false;
  }

  _onRenderFrame(lastFrameTimestamp) {
    if (!this._animating) { return; }
    let timestamp = Date.now();
    let dt = timestamp - lastFrameTimestamp;
    if (this._isFling) {
      this._rollBy(this._velocity * dt);
      this._velocity *= (1 - 0.01 * dt) ;
      if (Math.abs(this._velocity) < 0.001) { this._flingStop(); }
    }
    requestAnimationFrame(() => this._onRenderFrame(timestamp));
  }

  _onCycleTop() {
    let cycles = this._blocks.getCycles() - 1;
    console.log('top ' + cycles);
    let newBlock = this._textBlocks.getTop();
    let oldBlock = this._blocks.replace(0, newBlock);
    oldBlock.component.translateY(-this._blockHeight);
    newBlock.offset = cycles * (this._blockHeight * BLOCK_NUM) - newBlock.posIndex * this._blockHeight;
  }

  _onCycleBottom() {
    let cycles = this._blocks.getCycles() - 1;
    console.log('bottom ' + cycles);
    let newBlock = this._textBlocks.getBottom();
    let oldBlock = this._blocks.replace(0, newBlock);
    oldBlock.component.translateY(-this._blockHeight);
    newBlock.offset = cycles * (this._blockHeight * BLOCK_NUM) - newBlock.posIndex * this._blockHeight;
  }

  _handlePanResponderGrant() {
    this._flingStop();
    this._previousTouchDY = 0;
  }

  _handlePanResponderMove(e, gestureState) {
    this._touches.push(_.assign({}, gestureState, {timestamp: Date.now()}));
    this._rollBy(-(this._previousTouchDY - gestureState.dy));
    this._previousTouchDY = gestureState.dy;
  }

  _handlePanResponderEnd() {
    if (this._touches.length > 2) {
      let lastTouches = this._touches.slice(-3);
      let dy = lastTouches[lastTouches.length - 1].moveY - lastTouches[0].moveY;
      let dTime = lastTouches[lastTouches.length - 1].timestamp - lastTouches[0].timestamp;
      this._velocity = dy / (dTime ? dTime : 1);
      this._touches = [];
      this._flingStart();
    }
  }

  _flingStart() {
    this._isFling = true;
  }

  _flingStop() {
    this._velocity = 0;
    this._isFling = false;
  }

  _onBlockLayout(event) {
    if (this._blockLayout) { return; }
    this._blockLayout = true;
    this._blockHeight = event.nativeEvent.layout.height;
    this._upperRollThreshold = 0;
    this._bottomRollThreshold = -this._blockHeight;
    this._fullHeight = BLOCK_NUM * this._blockHeight;

  }

  _onLayout(event) {
    if (this._layout) { return; }
    if (!this._blockHeight) { throw new Error('Block height is not initialized!'); }
    this._layout = true;
    this._visibleHeight = event.nativeEvent.layout.height;
    this._centerOffset = this._visibleHeight / 2 - this._blockHeight / 2;
    this._rollBy(this._fullHeight + this._centerOffset);
  }

  _rollBy(offset) {
    this._rollTo(this._previousOffset + offset);
  }

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
  }

  _rollUp(boardsNum) {
    for (let i = 0; i < boardsNum; i++) {
      let bottomBlock = this._blocks.getBottom();
      bottomBlock.offset -= this._blockHeight * BLOCK_NUM;
    }
    this._upperRollThreshold += this._blockHeight * boardsNum;
    this._bottomRollThreshold += this._blockHeight * boardsNum;
  }

  _rollDown(boardsNum) {
    for (let i = 0; i < boardsNum; i++) {
      let topBlock = this._blocks.getTop();
      topBlock.offset += this._blockHeight * BLOCK_NUM;
    }
    this._upperRollThreshold -= this._blockHeight * boardsNum;
    this._bottomRollThreshold -= this._blockHeight * boardsNum;
  }

  renderBlocks() {
    let blocks = [];
    for (let i = 0; i < BLOCK_NUM; i++) {
      blocks.push(<Board
        key={i}
        onLayout={this._onBlockLayout.bind(this)}
        ref={component => this._blocks.push({component, offset: 0})}
      />);
    }
    for (let i = 0; i < this.props.text.length; i++) {
      blocks.push(<Board
        key={blocks.length}
        text={this.props.text[i]}
        ref={component => this._textBlocks.push({component, offset: 0, posIndex: i})}
      />);
    }
    return blocks;
  }

  render() {
    if (this.state.rendering) {
      return (
        <View
          style={styles.container}
          onLayout={() => this.setState({rendering: false})}
        >
          <ActivityIndicator style={styles.centered} />
        </View>
      );
    }
    else {
      return (
        <View
          style={styles.container}
          {...this._panResponder.panHandlers}
        >
          <View
            style={styles.container}
            onLayout={this._onLayout.bind(this)}
            ref={component => this._root = component} //eslint-disable-line no-return-assign
            >
            {this.renderBlocks()}
          </View>
        </View>
      );
    }
  }
}

PanView.propTypes = {
  debug: React.PropTypes.bool
};

PanView.defaultProps = {
  rowsNumber: 35,
  text: 'Hello, World!',
  debug: false
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignSelf: 'center'
  },
  container: {
    flex: 1,
    overflow: 'hidden'
  }
});

export default PanView;
