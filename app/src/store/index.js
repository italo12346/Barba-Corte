import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './rootReducer';
import rootSaga from './rootSaga';

// 1. Cria o middleware do Saga
const sagaMiddleware = createSagaMiddleware();

// 2. Configura a Store usando o padrão moderno (Redux Toolkit)
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Resolve o aviso de "non-serializable value" para o FormData
      serializableCheck: {
        ignoredActions: ['@perfil/UPDATE_PERFIL_REQUEST'],
        ignoredActionPaths: ['payload.fotoFile'],
      },
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// 3. Inicia o Saga
sagaMiddleware.run(rootSaga);

export default store;
