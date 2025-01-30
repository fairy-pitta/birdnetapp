package com.birdnetapp.audio;

import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AudioModule extends ReactContextBaseJavaModule {

    private static final int SAMPLE_RATE = 44100; // サンプルレート
    private static final int BUFFER_SIZE = AudioRecord.getMinBufferSize(
            SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT);

    private AudioRecord audioRecord;
    private ExecutorService executorService;
    private boolean isRecording = false;

    public AudioModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "AudioModule";
    }

    @ReactMethod
    public void startRecording() {
        if (isRecording) {
            return;
        }

        try {
            isRecording = true;
            audioRecord = new AudioRecord(
                    MediaRecorder.AudioSource.MIC,
                    SAMPLE_RATE,
                    AudioFormat.CHANNEL_IN_MONO,
                    AudioFormat.ENCODING_PCM_16BIT,
                    BUFFER_SIZE
            );

            executorService = Executors.newSingleThreadExecutor();
            audioRecord.startRecording();

            executorService.submit(() -> {
                byte[] buffer = new byte[BUFFER_SIZE];
                while (isRecording) {
                    int read = audioRecord.read(buffer, 0, buffer.length);
                    if (read > 0) {
                        WritableArray pcmArray = new WritableNativeArray();
                        for (int i = 0; i < read; i++) {
                            pcmArray.pushInt(buffer[i] & 0xFF); // 符号なしの 8 ビット値として送信
                        }

                        // PCM データを JS に送信
                        sendPCMData(pcmArray);
                    }
                }
            });
        } catch (Exception e) {
            isRecording = false;
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void stopRecording() {
        if (!isRecording) {
            return;
        }

        try {
            isRecording = false;
            if (audioRecord != null) {
                audioRecord.stop();
                audioRecord.release();
                audioRecord = null;
            }

            if (executorService != null) {
                executorService.shutdown();
                executorService = null;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void sendPCMData(WritableArray pcmArray) {
        new Handler(Looper.getMainLooper()).post(() -> {
            getReactApplicationContext()
                .getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onPCMData", pcmArray);
        });
    }
}