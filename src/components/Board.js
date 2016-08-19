import React, {PropTypes} from 'react';
import {
  View,
  Text,
  StyleSheet
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

const Board = React.createClass({
  propTypes: {
    colsNumber: PropTypes.number,
    rowsNumber: PropTypes.number,
    text: PropTypes.string
  },

  _resultTextMat: [],

  getDefaultProps() {
    return {
      colsNumber: 15,
      rowsNumber: 25,
      text: ''
    };
  },

  componentWillMount() {
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
        if (ri >= textStartRow &&
          ri < textEndRow &&
          textRows[ri - textStartRow][ci] &&
          textRows[ri - textStartRow][ci] !== ' ') {
          this._resultTextMat[ci][ri] = (
            <Text key={ri} style={styles.char}>
              {textRows[ri - textStartRow][ci]}
            </Text>
          );
        } else {
          this._resultTextMat[ci][ri] = (
            <Text key={ri} style={styles.randomChar}>
              {String.fromCharCode(_.random(CYRILLIC_RANGE[0], CYRILLIC_RANGE[1]))}
            </Text>
          );
        }
      }
    }
  },

  renderText() {
    this.generateResultTextMat();
    let cols = new Array(this.props.rowsNumber);
    for (let ci = 0; ci < this._resultTextMat.length; ci++) {
      cols[ci] = (<View key={ci} style={styles.col}>{this._resultTextMat[ci]}</View>);
    }
    return (<View style={styles.row}>{cols}</View>);
  },

  render() {
    return (
      <View style={styles.container}>
        {this.renderText()}
      </View>
    );
  }
});

const styles = StyleSheet.create({
  char: {
    color: 'black',
    fontFamily: 'monospace'
  },
  randomChar: {
    color: '#e6e6cb',
    fontFamily: 'monospace'
  },
  container: {
    flex: 1,
    paddingHorizontal: 20
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 0,
    padding: 0
  },
  col: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    margin: 0,
    padding: 0
  }
});

export default Board;
