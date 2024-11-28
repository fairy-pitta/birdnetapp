import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';

const RecordButton = ({ onPress, isRecording }: { onPress: () => void; isRecording: boolean }) => {
  return (
    <TouchableOpacity
      style={[styles.button, isRecording ? styles.recording : styles.notRecording]}
      onPress={onPress}
    >
      <Text style={styles.text}>{isRecording ? '停止' : '録音'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 50,
    margin: 20,
    alignItems: 'center',
  },
  recording: {
    backgroundColor: '#d32f2f',
  },
  notRecording: {
    backgroundColor: '#4caf50',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecordButton;