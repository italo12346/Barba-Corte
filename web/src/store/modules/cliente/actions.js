import Types from './types';

// GET
export const getClientes = (clientes) => ({
  type: Types.GET_CLIENTES_REQUEST,
   payload: clientes,
});

export const getClientesSuccess = (clientes) => ({
  type: Types.GET_CLIENTES_SUCCESS,
  payload: clientes,
});

export const getClientesFailure = (error) => ({
  type: Types.GET_CLIENTES_FAILURE,
  payload: error,
});

// CREATE
export const createCliente = (cliente) => ({
  type: Types.CREATE_CLIENTE_REQUEST,
  payload: cliente,
});

export const createClienteSuccess = (cliente) => ({
  type: Types.CREATE_CLIENTE_SUCCESS,
  payload: cliente,
});

export const createClienteFailure = (error) => ({
  type: Types.CREATE_CLIENTE_FAILURE,
  payload: error,
});

// UPDATE
export const updateCliente = (cliente) => ({
  type: Types.UPDATE_CLIENTE_REQUEST,
  payload: cliente,
});

export const updateClienteSuccess = (cliente) => ({
  type: Types.UPDATE_CLIENTE_SUCCESS,
  payload: cliente,
});

export const updateClienteFailure = (error) => ({
  type: Types.UPDATE_CLIENTE_FAILURE,
  payload: error,
});

// DELETE
export const deleteCliente = (id) => ({
  type: Types.DELETE_CLIENTE_REQUEST,
  payload: id,
});

export const deleteClienteSuccess = (id) => ({
  type: Types.DELETE_CLIENTE_SUCCESS,
  payload: id,
});

export const deleteClienteFailure = (error) => ({
  type: Types.DELETE_CLIENTE_FAILURE,
  payload: error,
});
export const getAgendamentosCliente = (clienteId) => ({
  type: Types.GET_AGENDAMENTOS_CLIENTE_REQUEST,
  payload: clienteId,
});

export const getAgendamentosClienteSuccess = (agendamentos) => ({
  type: Types.GET_AGENDAMENTOS_CLIENTE_SUCCESS,
  payload: agendamentos,
});

export const getAgendamentosClienteFailure = (error) => ({
  type: Types.GET_AGENDAMENTOS_CLIENTE_FAILURE,
  payload: error,
});
