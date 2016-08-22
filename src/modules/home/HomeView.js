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
            <Board colsNumber={20} rowsNumber={25} text='Всё, что ни происходит, всегда так, как нужно, и только к лучшему.'/>
          </View>
          <View style={styles.boardContainer}>
            <Board colsNumber={20} rowsNumber={25} text='Дари себя тому, кто будет благодарен, кто понимает, любит вас и ценит.'/>
          </View>
          <View style={styles.boardContainer}>
            <Board colsNumber={20} rowsNumber={25} text='Никогда ни о чем не сожалей: иногда неприятности случаются во благо, а мечты не исполняются к лучшему.'/>
          </View>
          <View style={styles.boardContainer}>
            <Board colsNumber={20} rowsNumber={25} text='Мир состоит из бездельников, которые хотят иметь деньги, не работая, и придурков, которые готовы работать, не богатея.'/>
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
