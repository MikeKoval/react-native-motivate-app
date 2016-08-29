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

class Board extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this._resultTextMat = [];
    for (let i = 0; i < this.props.rowsNumber; i++) {
      this._resultTextMat.push([]);
    }
  }

  _resultTextMat = [];
  _root = null;

  setNativeProps(nativeProps) {
    if (this._root) {
      this._root.setNativeProps(nativeProps);
    }
  }

  translateY(yPos) {
    if (this._root) {
      this._root.setNativeProps({style: {transform: [{translateY: yPos}]}});
    }
  }

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
        this._resultTextMat[ri][ci] = (
          <View key={ci} style={styles.charContainer}>
            <View style={styles.char}>
              <Text style={charTextStyle}>
                {char}
              </Text>
            </View>
          </View>
        );
      }
    }
  }

  renderText() {
    this.generateResultTextMat();
    let rows = new Array(this.props.rowsNumber);
    for (let ri = 0; ri < this._resultTextMat.length; ri++) {
      rows[ri] = (<View key={ri} style={styles.row}>{this._resultTextMat[ri]}</View>);
    }
    return rows;
  }

  render() {
    return (
      <View
        onLayout={this.props.onLayout}
        style={styles.container}
        ref={component => {this._root = component;}}
        renderToHardwareTextureAndroid={true}
        shouldRasterizeIOS={true}>
        {this.renderText()}
      </View>
    );
  }
}

Board.propTypes = {
  colsNumber: PropTypes.number,
  rowsNumber: PropTypes.number,
  text: PropTypes.string,
  onLayout: PropTypes.func
};

Board.defaultProps = {
  colsNumber: 25,
  rowsNumber: 7,
  text: ''
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden'
  },
  charContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1
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

export default Board;
