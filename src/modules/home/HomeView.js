import React from 'react';
import {
  StyleSheet,
  View
} from 'react-native';
import PanView from '../../components/PanView';

const HomeView = React.createClass({
  propTypes: {
  },

  render() {
    return (
      <View style={styles.container}>
        <PanView text={[
          'Всё, что ни происходит, всегда так, как нужно, и только к лучшему.',
          'Дари себя тому, кто будет благодарен, кто понимает, любит вас и ценит.'
        ]}/>
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
