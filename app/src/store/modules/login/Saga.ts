import { all, call, put, takeLatest } from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 🔥 expo install @react-native-async-storage/async-storage
import api from '../../../services/api';
import types from './Types';
import { loginSuccess, loginFailure } from './Actions';

export function* login({ payload }) {
  try {
    const { email, senha } = payload;
    
    // Chamada para a API de login
    const response = yield call(api.post, '/salao/login', { email, senha });
    const res = response.data;

    if (res.error) {
      yield put(loginFailure(res.message));
    } else {
      // 🔥 Salva o token e os dados no celular (AsyncStorage)
      yield call(AsyncStorage.setItem, '@barbacorte:salao', JSON.stringify(res.salao));
      
      // Atualiza o Redux
      yield put(loginSuccess(res.salao));
      
      // Aqui você pode disparar a navegação para a Home se quiser fazer via Saga
      // ou deixar o componente reagir ao sucesso no estado global.
    }
  } catch (err) {
    const errorMsg = err?.response?.data?.message || 'Erro ao conectar com o servidor.';
    yield put(loginFailure(errorMsg));
  }
}

export default function* authSaga() {
  yield all([
    takeLatest(types.LOGIN_REQUEST, login),
  ]);
}
