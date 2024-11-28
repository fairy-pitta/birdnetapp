import React, { Component } from 'react';
import { View, StyleSheet, Alert, Platform, PermissionsAndroid } from 'react-native';
import { Button, Card, Title } from 'react-native-paper';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

export default class App extends Component {
  audioRecorderPlayer: AudioRecorderPlayer;

  constructor(props) {
    super(props);
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.state = {
      recordTime: '00:00:00',
      isRecording: false, // 録音中の状態
    };
  }

  componentDidMount() {
    this.requestPermissions();
  }

  requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        if (
          granted['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert('Permission Denied', '録音およびストレージの権限が必要です。');
        } else {
          console.log('All permissions granted');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  onStartRecord = async () => {
    if (this.state.isRecording) {
      console.log('Already recording. Ignoring duplicate request.');
      return;
    }

    console.log('Attempting to start recorder...');
    const path =
      Platform.OS === 'ios'
        ? `${RNFS.DocumentDirectoryPath}/hello.m4a`
        : `${RNFS.ExternalDirectoryPath}/hello.m4a`;

    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };

    try {
      const uri = await this.audioRecorderPlayer.startRecorder(path, audioSet);
      this.audioRecorderPlayer.addRecordBackListener((e) => {
        this.setState({
          recordTime: this.audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
        });
      });

      console.log(`Recording started at: ${uri}`);
      this.setState({ isRecording: true });
    } catch (error) {
      console.error('Error while starting recording:', error);
    }
  };

  onStopRecord = async () => {
    console.log('Stopping recording...');
    try {
      const result = await this.audioRecorderPlayer.stopRecorder();
      this.audioRecorderPlayer.removeRecordBackListener();
      console.log(`Recording stopped. File saved at: ${result}`);

      this.setState({ isRecording: false, recordTime: '00:00:00' });
    } catch (error) {
      console.error('Error while stopping recording:', error);
    }
  };

  render() {
    return (
      <Card style={styles.card}>
        <View style={styles.container}>
          <Title>録音時間: {this.state.recordTime}</Title>
          <Button
            mode="contained"
            icon="record"
            onPress={() => {
              console.log('Record button pressed');
              this.onStartRecord();
            }}
            style={styles.button}
          >
            RECORD
          </Button>
          <Button
            mode="contained"
            icon="stop"
            onPress={this.onStopRecord}
            style={styles.button}
          >
            STOP
          </Button>
        </View>
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
    width: 200,
  },
});