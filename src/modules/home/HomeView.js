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
          <Board colsNumber={16} rowsNumber={25} text='Всё, что ни происходит, всегда так, как нужно, и только к лучшему.'/>
        </PanView>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffe6'
  }
});

export default HomeView;
