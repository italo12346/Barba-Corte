import types from "./types";

// LISTAR POR SALÃO
export const allColaboradores = (salaoId) => ({
  type: types.LIST_COLABORADORES_REQUEST,
  payload: salaoId,
});

// CRIAR
export const createColaborador = (data) => ({
  type: types.CREATE_COLABORADOR_REQUEST,
  payload: data,
});

// ATUALIZAR
export const updateColaborador = (data) => ({
  type: types.UPDATE_COLABORADOR_REQUEST,
  payload: data,
});

// REMOVER
export const unlikeColaborador = (id) => ({
  type: types.UNLIKE_COLABORADOR_REQUEST,
  payload: id,
});

// SERVIÇOS
export const allServicos = (id) => ({
  type: types.LIST_SERVICOS_REQUEST,
  payload: id,
});

// FORM
export const updateForm = (data) => ({
  type: types.UPDATE_FORM,
  payload: data,
});


export const loadServicosColaborador = (especialidadesIds) => ({
  type: types.LOAD_SERVICOS_COLABORADOR_REQUEST,
  payload: especialidadesIds,
});