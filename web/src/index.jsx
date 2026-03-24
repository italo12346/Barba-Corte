import ReactDOM from 'react-dom/client';
import Routes from './routes';
import { Provider } from 'react-redux';
import store from './store';

import '@mdi/font/css/materialdesignicons.min.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <Routes />
  </Provider>
);
