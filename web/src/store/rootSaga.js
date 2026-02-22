import { all } from 'redux-saga/effects';
import agendamentoSaga from './modules/agendamento/saga';
import clienteSaga from './modules/cliente/saga';
import colaboradorSaga from './modules/colaboradores/sagas';
import servicoSaga from './modules/servico/sagas';
import horarioSaga from './modules/horario/sagas';

export default function* rootSaga() {
  yield all([
    agendamentoSaga,
    clienteSaga(),
    colaboradorSaga(),
    servicoSaga(),
    horarioSaga
  ]);
}
