import { all } from 'redux-saga/effects';
import agendamentoSaga from './modules/agendamento/saga';

export default function* rootSaga() {
  yield all([
    agendamentoSaga,
  ]);
}
