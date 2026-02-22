import types from "./types";

// ==============================
// LISTAR
// ==============================
export const listServicos = (salaoId) => ({
  type: types.LIST_SERVICOS_REQUEST,
  payload: { salaoId }, 
});

// ==============================
// CRIAR
// ==============================
export const createServico = (data) => ({
  type: types.CREATE_SERVICO_REQUEST,
  payload: data,
});

// ==============================
// ATUALIZAR
// ==============================
export const updateServico = (data) => ({
  type: types.UPDATE_SERVICO_REQUEST,
  payload: data,
});

// ==============================
// REMOVER
// ==============================
export const deleteServico = (data) => ({
  type: types.DELETE_SERVICO_REQUEST,
  payload: data,
});

// ==============================
// FORM
// ==============================
export const updateForm = (data) => ({
  type: types.UPDATE_FORM,
  payload: data,
});

export const resetForm = () => ({
  type: types.RESET_FORM,
});
