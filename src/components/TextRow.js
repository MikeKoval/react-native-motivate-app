import React, {PropTypes} from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';
import _ from 'lodash';

const CYRILLIC_RANGE = [0x0410, 0x042F];
//const LATIN_RANGER = [0x0041, 0x005A];

// export function wordToArray(word) {
//   let arr = word.split('');
//   for (let i = 1; i < arr.length; i++) {
//     if (arr[i] === '.' || arr[i] === ',' || arr[i] === ':' || arr[i] === '!' || arr[i] === '?') {
//       arr.splice(i - 1, 2, arr[i - 1] + arr[i]);
//     }
//   }
//   return arr;
// }
//
// export function splitTextToRowArrays(text, rowLength) {
//   let words = text.toUpperCase().split(' ').reverse();
//   const rows = [];
//   while (words.length) {
//     const row = [];
//     row.push(...wordToArray(words.pop()));
//     while (words.length && words[words.length - 1].length + row.length < rowLength) {
//       row.push(' ', ...wordToArray(words.pop()));
//     }
//     const padding = Math.floor(Math.abs(row.length - rowLength) / 2);
//     rows.push([...new Array(padding), ...row]);
//   }
//   return rows;
// }

class TextRow extends React.Component {
  constructor(props) {
    super(props);
  }

  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  _root = null;
  _chars = [];

  setText() {
    // TODO: set text via this._chars
  }

  renderRow() {
    const resultRow = [];
    const textArr = this.props.text.toUpperCase().split('');
    const textStartIndex = this.props.length / 2 - textArr.length / 2;
    const textEndIndex = textStartIndex + textArr.length;
    for (let i = 0; i < this.props.length; i++) {
      let charTextStyle;
      let char;
      if (i >= textStartIndex && i < textEndIndex) {
        charTextStyle = styles.charText;
        char = textArr[i - textStartIndex];
      } else {
        charTextStyle = styles.randomCharText;
        char = String.fromCharCode(_.random(CYRILLIC_RANGE[0], CYRILLIC_RANGE[1]));
      }
      resultRow[i] = (
        <View key={i} style={styles.charContainer}>
          <View style={styles.char}>
            <Text style={charTextStyle} ref={ component => this._chars.push(component)} >
              {char}
            </Text>
          </View>
        </View>
      );
    }
    return resultRow;
  }

  render() {
    return (
      <View
        style={styles.row}
        renderToHardwareTextureAndroid={true}
        shouldRasterizeIOS={true}
        ref = {component => {this._root = component;}}
      >
        {this.renderRow()}
      </View>
    );
  }
}

TextRow.defaultProps = {
  length: 15,
  text: ''
};

TextRow.propTypes = {
  length: PropTypes.number,
  text: PropTypes.string
};


const styles = StyleSheet.create({
  charContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between'
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
  }
});

export default TextRow;
