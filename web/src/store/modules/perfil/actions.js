import types from "./types";

/**
 * Dispara a solicitação de atualização do perfil.
 * @param {Object} payload - Objeto contendo os dados do formulário (nome, email, cep, etc.) e o arquivo de foto.
 */
export function updatePerfilRequest(payload) {
  return {
    type: types.UPDATE_PERFIL_REQUEST,
    payload,
  };
}

/**
 * Chamada pelo Saga quando a atualização é bem-sucedida.
 * @param {Object} salao - Objeto do salão atualizado retornado pela API.
 */
export function updatePerfilSuccess(salao) {
  return {
    type: types.UPDATE_PERFIL_SUCCESS,
    payload: salao,
  };
}

/**
 * Chamada pelo Saga quando ocorre um erro na atualização.
 * @param {string} error - Mensagem de erro.
 */
export function updatePerfilFailure(error) {
  return {
    type: types.UPDATE_PERFIL_FAILURE,
    payload: error,
  };
}
