import { useState } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  const audioRecorderPlayer = new AudioRecorderPlayer();

  const startRecording = async () => {
    const result = await audioRecorderPlayer.startRecorder();
    setFilePath(result);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    await audioRecorderPlayer.stopRecorder();
    setIsRecording(false);
  };

  return {
    isRecording,
    filePath,
    startRecording,
    stopRecording,
  };
};