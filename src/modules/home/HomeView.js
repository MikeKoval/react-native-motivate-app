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
        <PanView/>
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
