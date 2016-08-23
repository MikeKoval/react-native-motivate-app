import React from 'react';
import {
  View,
  PanResponder,
  Animated,
  StyleSheet,
  Dimensions
} from 'react-native';

import _ from 'lodash';
import TextRow from './TextRow';

const {height} = Dimensions.get('window');
console.log(height);

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
}

const PanView = React.createClass({
  propTypes: {

  },
  _previousOffset: 0,
  _boardHeight: 0,
  _height: 0,
  _styles: {},
  _animation: null,
  _targetView: 0,
  _touches: [],
  _rows: new CircularArray(),
  _upperRollThreshold: 0,
  _bottomRollThreshold: 0,

  getDefaultProps() {
    return {
      rowsNumber: 25,
      text: 'Hello, World!'
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
    this._touches.push(_.assign({}, gestureState, {timestamp: Date.now()}));
    //this.state.offset.setValue(this._previousOffset + gestureState.dy);
    this._roll(this._previousOffset + gestureState.dy);
    //this._styles.style.transform[0].translateY = this._previousOffset + gestureState.dy;
    //this._updateNativeStyles();
  },

  _handlePanResponderEnd(e, gestureState) {
    this._previousOffset += gestureState.dy;

  },

  _onLayout(event) {
    this._height = event.nativeEvent.layout.height;
    this._rowHeight = this._height / this.props.rowsNumber;
    // this._boardHeight = event.nativeEvent.layout.height / 3;
    // const style = {transform: [{translateY: -this._boardHeight}]};
    // this._root.setNativeProps({style});
    // this._upperRollThreshold = this._boardHeight / 2;
    // this._bottomRollThreshold = -this._boardHeight / 2;
  },

  _roll(offset) {
    this._root.setNativeProps({style: {transform: [{translateY: offset}]}});
    // for (var i = 0; i < this._rows.length; i++) {
    //   const style = {transform: [{translateY: offset + this._rows[i].offset}]};
    //   this._rows[i].component.setNativeProps({style});
    // }
    if (offset > this._upperRollThreshold) { this._rollUp(); }
    //else if (offset < this._bottomRollThreshold) { this._rollDown(); }
  },

  _rollUp() {
    console.log('rollup');
    let bottomRow = this._rows.getBottom();
    bottomRow.offset -= this._height - 100;
    const style = {transform: [{translateY: bottomRow.offset}]};
    bottomRow.component.setNativeProps({style});

    this._upperRollThreshold += this._rowHeight;
    this._bottomRollThreshold += this._rowHeight;
  },

  _rollDown() {
    console.log('rolldown');
    this._boards[0].offset += this._boardHeight * 3;
    let tmp = this._boards[0];
    this._boards[0] = this._boards[1];
    this._boards[1] = this._boards[2];
    this._boards[2] = tmp;
    this._upperRollThreshold -= this._boardHeight;
    this._bottomRollThreshold -= this._boardHeight;
  },

  renderRows() {
    let rows = [];
    for (var i = 0; i < this.props.rowsNumber; i++) {
      rows.push(<TextRow key={i} ref={component => this._rows.push({component, offset: 0})}/>);
    }
    return rows;
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
