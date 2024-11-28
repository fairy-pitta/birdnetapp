/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// デフォルト設定を取得
const defaultConfig = getDefaultConfig(__dirname);

const {
  resolver: { sourceExts, assetExts },
} = defaultConfig;

// カスタム設定
const config = {
  transformer: {
    // SVG対応のトランスフォーマーを指定
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true, // パフォーマンス向上
      },
    }),
  },
  resolver: {
    // SVGをアセットとしてではなくソースとして扱う
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'], // 'svg' をソース拡張子に追加
    blacklistRE: /.*\/__fixtures__\/.*/, // 不要フォルダを除外
  },
  maxWorkers: Math.max(1, require('os').cpus().length - 1), // 適切なスレッド数
  watchFolders: ['.'], // ルートフォルダのみ監視
};

// デフォルト設定とマージ
module.exports = mergeConfig(defaultConfig, config);