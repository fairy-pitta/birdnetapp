import React from 'react';
import { View, StyleSheet } from 'react-native';

const Sonogram = () => {
  return <View style={styles.container}>{/* リアルタイム描画ロジックを追加 */}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
});

export default Sonogram;