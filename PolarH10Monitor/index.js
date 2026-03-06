/**
 * @format
 */

// Polyfill crypto.getRandomValues() for React Native (required by crypto-js).
// Must be the first import so it patches the global before any crypto usage.
import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import 'react-native-screens';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
