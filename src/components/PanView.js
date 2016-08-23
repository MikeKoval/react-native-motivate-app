import React from 'react';
import {
  View,
  PanResponder,
  Animated,
  StyleSheet,
  Text
} from 'react-native';

import _ from 'lodash';

const CYRILLIC_RANGE = [0x0410, 0x042F];
//const LATIN_RANGER = [0x0041, 0x005A];

export function wordToArray(word) {
  let arr = word.split('');
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === '.' || arr[i] === ',' || arr[i] === ':' || arr[i] === '!' || arr[i] === '?') {
      arr.splice(i - 1, 2, arr[i - 1] + arr[i]);
    }
  }
  return arr;
}

export function splitTextToRowArrays(text, rowLength) {
  let words = text.toUpperCase().split(' ').reverse();
  const rows = [];
  while (words.length) {
    const row = [];
    row.push(...wordToArray(words.pop()));
    while (words.length && words[words.length - 1].length + row.length < rowLength) {
      row.push(' ', ...wordToArray(words.pop()));
    }
    const padding = Math.floor(Math.abs(row.length - rowLength) / 2);
    rows.push([...new Array(padding), ...row]);
  }
  return rows;
}

const PanView = React.createClass({
  propTypes: {

  },
  _previousOffset: 0,
  _boardHeight: 0,
  _styles: {},
  _animation: null,
  _targetView: 0,
  _touches: [],
  _resultTextMat: [],
  _boards: [],
  _upperRollThreshold: 0,
  _bottomRollThreshold: 0,

  getDefaultProps() {
    return {
      colsNumber: 15,
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
      transform: [{translateY: this._previousOffset}],
      overflow: 'hidden'
    };

    this._resultTextMat = new Array(this.props.colsNumber);
    for (let i = 0; i < this._resultTextMat.length; i++) {
      this._resultTextMat[i] = new Array(this.props.rowsNumber);
    }
  },

  generateResultTextMat() {

    const textRows = splitTextToRowArrays(this.props.text, this.props.colsNumber);
    const textStartRow = Math.round(this.props.rowsNumber / 2 - textRows.length);
    const textEndRow = textStartRow + textRows.length;

    for (let ri = 0; ri < this.props.rowsNumber; ri++) {
      for (let ci = 0; ci < this.props.colsNumber; ci++) {
        let charTextStyle;
        let char;
        if (ri >= textStartRow && ri < textEndRow && textRows[ri - textStartRow][ci] && textRows[ri - textStartRow][ci] !== ' ') {
          charTextStyle = styles.charText;
          char = textRows[ri - textStartRow][ci];
        } else {
          charTextStyle = styles.randomCharText;
          char = String.fromCharCode(_.random(CYRILLIC_RANGE[0], CYRILLIC_RANGE[1]));
        }
        this._resultTextMat[ci][ri] = (
          <View key={ri} style={styles.charContainer}>
            <View style={styles.char}>
              <Text style={charTextStyle}>
                {char}
              </Text>
            </View>
          </View>
        );
      }
    }
  },

  renderRandomText() {
    this.generateResultTextMat();
    let cols = [];
    for (let ci = 0; ci < this._resultTextMat.length; ci++) {
      cols[ci] = (<View key={ci} style={styles.col}>{this._resultTextMat[ci]}</View>);
    }
    return (<View style={styles.row}>{cols}</View>);
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

    // let vy = 0;
    // if (this._touches.length > 2) {
    //   let lastTouches = this._touches.slice(-5);
    //   let dy = lastTouches[lastTouches.length - 1].moveY - lastTouches[0].moveY;
    //   let dTime = lastTouches[lastTouches.length - 1].timestamp - lastTouches[0].timestamp;
    //   vy = dy / (dTime ? dTime : 1) * 0.2;
    //   this._touches = [];
    // }
    //
    // //let animationTargetView = Math.round(-(this.state.offset.__getValue() + fling * this._boardHeight) / this._boardHeight);
    // let animationTargetView = Math.round(-this.state.offset.__getValue() / this._boardHeight - vy);
    //
    //
    // animationTargetView = _.clamp(animationTargetView, 0, this._boards.length - 1);
    // const animationTargetOffset = -animationTargetView * this._boardHeight;
    //
    // this._targetView = animationTargetOffset;
    //
    // this._previousOffset = animationTargetOffset;
    // //this._previousOffset += gestureState.dy;
    // this._animation = Animated.spring(
    //   this.state.offset,
    //   {toValue: animationTargetOffset}
    // );
    // this._animation.start();
  },

  _onLayout(event) {
    this._boardHeight = event.nativeEvent.layout.height / 3;
    const style = {transform: [{translateY: -this._boardHeight}]};
    this._root.setNativeProps({style});
    this._upperRollThreshold = this._boardHeight / 2;
    this._bottomRollThreshold = -this._boardHeight / 2;
  },

  _roll(offset) {
    for (var i = 0; i < this._boards.length; i++) {
      const style = {transform: [{translateY: offset + this._boards[i].offset}]};
      this._boards[i].component.setNativeProps({style});
    }
    if (offset > this._upperRollThreshold) { this._rollUp(); }
    else if (offset < this._bottomRollThreshold) { this._rollDown(); }
  },

  _rollUp() {
    console.log('rollup');
    this._boards[2].offset -= this._boardHeight * 3;
    let tmp = this._boards[2];
    this._boards[2] = this._boards[1];
    this._boards[1] = this._boards[0];
    this._boards[0] = tmp;
    this._upperRollThreshold += this._boardHeight;
    this._bottomRollThreshold += this._boardHeight;
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

  //style={{transform: [{translateY: this.state.offset}], overflow: 'hidden'}}
  render() {
    //console.log('render');
    return (
      <Animated.View
        removeClippedSubviews={true}
        onLayout={this._onLayout}
        {...this._panResponder.panHandlers}
        ref={component => this._root = component} //eslint-disable-line no-return-assign
        >
        <View
          style={styles.container}
          renderToHardwareTextureAndroid={true}
          shouldRasterizeIOS={true}
          ref={component => this._boards[0] = {component, offset: 0}} //eslint-disable-line no-return-assign
        >
          {this.renderText()}
        </View>
        <View
          style={styles.container}
          renderToHardwareTextureAndroid={true}
          shouldRasterizeIOS={true}
          ref={component => this._boards[1] = {component, offset: 0}} //eslint-disable-line no-return-assign
        >
          {this.renderText()}
        </View>
        <View
          style={styles.container}
          renderToHardwareTextureAndroid={true}
          shouldRasterizeIOS={true}
          ref={component => this._boards[2] = {component, offset: 0}} //eslint-disable-line no-return-assign
        >
          {this.renderText()}
        </View>
      </Animated.View>
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
