import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

declare global {
  interface Console {
    tron: typeof Reactotron;
  }
}

Reactotron
  .setAsyncStorageHandler(AsyncStorage)
  .configure({ name: 'Barba&Corte' })
  .use(reactotronRedux())
  .useReactNative()
  .connect();

  console.tron = Reactotron;
export default Reactotron;