import React from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import PanView from '../../components/PanView';

const HomeView = React.createClass({
  propTypes: {
  },

  render() {
    return (
      <View style={styles.container}>
        <PanView>
          <Text>Hello, World!</Text>
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
    backgroundColor: 'white'
  }
});

export default HomeView;
