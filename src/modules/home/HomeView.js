import React from 'react';
import {
  StyleSheet,
  View
} from 'react-native';
import PanView from '../../components/PanView';
import Board from '../../components/Board';

const HomeView = React.createClass({
  propTypes: {
  },

  render() {
    return (
      <View style={styles.container}>
        <PanView>
          <View style={styles.boardContainer}>
           <Board colsNumber={25} rowsNumber={30} text='Всё, что ни происходит, всегда так, как нужно, и только к лучшему.'/>
          </View>
          <View style={styles.boardContainer}>
            <Board colsNumber={25} rowsNumber={30} text='Всё, что ни происходит, всегда так, как нужно, и только к лучшему.'/>
          </View>
          <View style={styles.boardContainer}>
            <Board colsNumber={25} rowsNumber={30} text='Всё, что ни происходит, всегда так, как нужно, и только к лучшему.'/>
          </View>
          <View style={styles.boardContainer}>
            <Board colsNumber={25} rowsNumber={30} text='Всё, что ни происходит, всегда так, как нужно, и только к лучшему.'/>
          </View>
          <View style={styles.boardContainer}>
            <Board colsNumber={25} rowsNumber={30} text='Всё, что ни происходит, всегда так, как нужно, и только к лучшему.'/>
          </View>
          <View style={styles.boardContainer}>
            <Board colsNumber={25} rowsNumber={30} text='Всё, что ни происходит, всегда так, как нужно, и только к лучшему.'/>
          </View>
        </PanView>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffe6'
  },
  boardContainer: {
    flex: 1
  }
});

export default HomeView;
