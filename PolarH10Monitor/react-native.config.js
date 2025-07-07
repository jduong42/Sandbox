module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: {
          project: './ios/PolarH10Monitor.xcodeproj',
          xcodeprojDirPath: './ios',
          plist: [],
        },
      },
    },
  },
  assets: ['./node_modules/react-native-vector-icons/Fonts/'],
};
