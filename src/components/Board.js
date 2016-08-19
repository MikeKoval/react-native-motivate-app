import React, {PropTypes} from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';
import _ from 'lodash';

const CYRILLIC_RANGE = [0x0410, 0x042F];
//const LATIN_RANGER = [0x0041, 0x005A];

const Board = React.createClass({
  propTypes: {
    colsNumber: PropTypes.number,
    rowsNumber: PropTypes.number
  },

  _textArr: [],

  getDefaultProps() {
    return {
      colsNumber: 15,
      rowsNumber: 25
    };
  },

  componentWillMount() {
    this._textArr = new Array(this.props.colsNumber * this.props.rowsNumber);
  },

  generateText() {
    for (let i = 0; i < this._textArr.length; i++) {
      this._textArr[i] = String.fromCharCode(_.random(CYRILLIC_RANGE[0], CYRILLIC_RANGE[1]));
      const str = 'ВАСЯ ПУПКІН ВАСЯ ПУПКІН ВАСЯ ПУПКІН ВАСЯ ПУПКІН ВАСЯ ПУПКІН';
      this._textArr.splice(100, str.length, ...str);
    }
  },

  renderText() {
    this.generateText();
    let rows = new Array(this.props.rowsNumber);
    for (let row = 0; row < rows.length; row++) {
      let cols = new Array(this.props.colsNumber);
      for (let col = 0; col < this.props.colsNumber; col++) {
        cols[col] = (<Text key={col}>{this._textArr[row * this.props.colsNumber + col]}</Text>);
      }
      rows[row] = (<View key={row} style={styles.row}>{cols}</View>);
    }
    return (<View style={styles.col}>{rows}</View>);
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
  container: {
    flex: 1,
    paddingHorizontal: 20
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  col: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
});

export default Board;
