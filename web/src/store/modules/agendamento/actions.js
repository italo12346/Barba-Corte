import types from './types';


/*
=========================
CREATE
=========================
*/

export const createAgendamento = data => ({
  type: types.CREATE_AGENDAMENTO,
  payload: data,
});

/*
=========================
UPDATE
=========================
*/

export function updateAgendamento(agendamentos) {
  return {
    type: types.UPDATE_AGENDAMENTOS,
    payload: { agendamentos },
  };
}
