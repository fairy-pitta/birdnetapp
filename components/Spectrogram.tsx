import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface SpectrogramProps {
  data: number[]; // FFTデータを受け取る
}

const Spectrogram: React.FC<SpectrogramProps> = ({ data }) => {
  const width = 300; // スペクトログラムの幅
  const height = 150; // スペクトログラムの高さ
  const barWidth = width / data.length; // 各バーの幅

  return (
    <View>
      <Svg width={width} height={height}>
        {data.map((value, index) => {
          const barHeight = (value / Math.max(...data)) * height; // 正規化して高さを計算
          return (
            <Rect
              key={index}
              x={index * barWidth}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
              fill="blue"
            />
          );
        })}
      </Svg>
    </View>
  );
};

export default Spectrogram;