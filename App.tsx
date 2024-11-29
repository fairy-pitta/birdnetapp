import React, { Component } from 'react';
import { View, StyleSheet, Alert, Platform, PermissionsAndroid } from 'react-native';
import { Button, Card, Title, Divider } from 'react-native-paper';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

interface AppState {
  recordTime: string;
  isRecording: boolean;
  isPlaying: boolean;
  playTime: string;
  duration: string;
  filePath: string;
}

export default class App extends Component<{}, AppState>{
  audioRecorderPlayer: AudioRecorderPlayer;

  constructor(props: {}) {
    super(props);
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.state = {
      recordTime: '00:00:00',
      isRecording: false,
      isPlaying: false,
      playTime: '00:00:00',
      duration: '00:00:00',
      filePath: '',
    };
  }

  componentDidMount() {
    this.requestPermissions();
  }

  // パーミッションのリクエスト
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
        console.warn('Permission request error:', err);
      }
    }
  };

  // 録音を開始
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

      // 録音中の進行状況を監視
      this.audioRecorderPlayer.addRecordBackListener((e) => {
        if (e && e.currentPosition !== undefined) {
          const currentPosition = Math.floor(e.currentPosition);
          console.log('Recording progress:', currentPosition);

          this.setState({
            recordTime: this.audioRecorderPlayer.mmssss(currentPosition),
          });
        } else {
          console.warn('Recording progress listener received undefined.');
        }
      });

      console.log(`Recording started at: ${uri}`);
      this.setState({ isRecording: true, filePath: path });
    } catch (error) {
      console.error('Error while starting recording:', error);
    }
  };

  // 録音を停止
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

  // 再生を開始
  onStartPlay = async () => {
    if (this.state.isPlaying) {
      console.log('Already playing. Ignoring duplicate request.');
      return;
    }

    const { filePath } = this.state;
    if (!filePath) {
      Alert.alert('No recording found', '録音が見つかりません。');
      return;
    }

    console.log('Attempting to start playback...');
    try {
      const uri = await this.audioRecorderPlayer.startPlayer(filePath);
      this.audioRecorderPlayer.setVolume(1.0);

      // 再生中の進行状況を監視
      this.audioRecorderPlayer.addPlayBackListener((e) => {
        if (e && e.currentPosition !== undefined && e.duration !== undefined) {
          const currentPosition = Math.floor(e.currentPosition);
          const duration = Math.floor(e.duration);

          console.log('Playback progress:', currentPosition);

          this.setState({
            playTime: this.audioRecorderPlayer.mmssss(currentPosition),
            duration: this.audioRecorderPlayer.mmssss(duration),
          });
        } else {
          console.warn('Playback progress listener received undefined.');
        }

        // 再生終了時の処理
        if (e.currentPosition >= e.duration) {
          this.onStopPlay();
        }
      });

      console.log(`Playback started at: ${uri}`);
      this.setState({ isPlaying: true });
    } catch (error) {
      console.error('Error while starting playback:', error);
    }
  };

  // 再生を停止
  onStopPlay = async () => {
    console.log('Stopping playback...');
    try {
      await this.audioRecorderPlayer.stopPlayer();
      this.audioRecorderPlayer.removePlayBackListener();

      this.setState({ isPlaying: false, playTime: '00:00:00', duration: '00:00:00' });
    } catch (error) {
      console.error('Error while stopping playback:', error);
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
            onPress={this.onStartRecord}
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
          <Divider style={styles.divider} />
          <Title>
            再生時間: {this.state.playTime} / {this.state.duration}
          </Title>
          <Button
            mode="contained"
            icon="play"
            onPress={this.onStartPlay}
            style={styles.button}
          >
            PLAY
          </Button>
          <Button
            mode="contained"
            icon="stop"
            onPress={this.onStopPlay}
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
  divider: {
    marginVertical: 20,
    backgroundColor: '#000',
    height: 1,
    width: '80%',
  },
});