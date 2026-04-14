import ReactDOM from 'react-dom/client';
import Routes from './routes';
import { Provider } from 'react-redux';
import store from './store';
import { GoogleOAuthProvider } from '@react-oauth/google'; 

import '@mdi/font/css/materialdesignicons.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Dispara a verificação de token existente ao iniciar
store.dispatch({ type: "@auth/VERIFY_TOKEN_REQUEST" });
console.log("Google Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);

root.render(
  <GoogleOAuthProvider 
    clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "883414505243-ac3ej0jl5oleo5voo7qijjbir9ben4h2.apps.googleusercontent.com"}
  >
    <Provider store={store}>
      <Routes />
    </Provider>
  </GoogleOAuthProvider>
);
