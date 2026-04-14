// store/modules/auth/sagas.js
import { call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import types from "./authTypes";

function* loginSaga({ payload }) {
  try {
    const { data } = yield call(api.post, "/auth/login", payload);

    // Salva token no localStorage e no header padrão do axios
    localStorage.setItem("token", data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

    yield put({ type: types.LOGIN_SUCCESS, payload: data });
  } catch (err) {
    const msg = err?.response?.data?.message || "Erro ao fazer login";
    yield put({ type: types.LOGIN_FAILURE, payload: msg });
  }
}

function* registerSaga({ payload }) {
  try {
    const { data } = yield call(api.post, "/auth/register", payload);

    localStorage.setItem("token", data.token);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

    yield put({ type: types.REGISTER_SUCCESS, payload: data });
  } catch (err) {
    const msg = err?.response?.data?.message || "Erro ao registrar";
    yield put({ type: types.REGISTER_FAILURE, payload: msg });
  }
}

function* verifyTokenSaga() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      yield put({ type: types.VERIFY_TOKEN_FAILURE, });
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const { data } = yield call(api.get, "/auth/me");

    yield put({ type: types.VERIFY_TOKEN_SUCCESS, payload: data.salao });
  } catch (err) {
    localStorage.removeItem("token");
    yield put({ type: types.VERIFY_TOKEN_FAILURE, payload: "Token inválido" });
  }
}

function* logoutSaga() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("profileLoaded");
  delete api.defaults.headers.common["Authorization"];
  yield put({ type: types.LOGOUT_SUCCESS });
}

export default function* authSaga() {
  yield takeLatest(types.LOGIN_REQUEST,        loginSaga);
  yield takeLatest(types.REGISTER_REQUEST,     registerSaga);
  yield takeLatest(types.VERIFY_TOKEN_REQUEST, verifyTokenSaga);
  yield takeLatest(types.LOGOUT,               logoutSaga);
  
}
