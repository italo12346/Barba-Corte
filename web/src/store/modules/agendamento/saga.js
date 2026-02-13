import { takeLatest, all, call, put } from 'redux-saga/effects';
import api from '../../../services/api';
import consts from '../../../consts/consts';
import types from './types';
import { updateAgendamento } from './actions';

export function* filterAgendamentos(action) {
  try {
    const { start, end } = action.payload;

    const {data: response} = yield call(api.post, '/agendamento/filter', {
      salaoId: consts.salaoId,
      range: {
        start,
        end,
      }
    });

    if(response.error) {
      console.error('Erro na resposta:', response.error);
      throw new Error(response.error);
    }

    yield put(updateAgendamento(response.agendamentos));

  } catch (err) {
    console.error('Erro filter:', err);

    yield put({
      type: types.FILTER_AGENDAMENTOS_ERROR
    });
  }
}

export default all([
  takeLatest(types.FILTER_AGENDAMENTOS, filterAgendamentos)
]);
