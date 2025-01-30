// App.tsx
import React from 'react';
import { SafeAreaView } from 'react-native';
import Step1RecordingCheck from './components/RecordingCheck';

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Step1RecordingCheck />
    </SafeAreaView>
  );
};

export default App;