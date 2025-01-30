// Step1RecordingCheck.js

import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import LiveAudioStream from 'react-native-live-audio-stream';

export default function Step1RecordingCheck() {
  useEffect(() => {
    const options = {
      sampleRate: 32000, 
      channels: 1, 
      bitsPerSample: 16,
      audioSource: 6, // Android only
      bufferSize: 4096
    };
    LiveAudioStream.init(options);

    const subscription = LiveAudioStream.on('data', data => {
      // dataはBase64エンコードされたPCMデータのチャンク
      console.log('PCM base64 chunk:', data);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const startRecording = () => {
    LiveAudioStream.start();
    console.log('Recording started');
  };

  const stopRecording = () => {
    LiveAudioStream.stop();
    console.log('Recording stopped');
  };

  return (
    <View style={{ marginTop:50 }}>
      <Button title="Start Recording" onPress={startRecording} />
      <Button title="Stop Recording" onPress={stopRecording} />
    </View>
  );
}