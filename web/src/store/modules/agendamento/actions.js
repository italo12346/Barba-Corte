import types from "./types";

// ── Filtrar ────────────────────────────────────────────────────────────────
export const filterAgendamentos = (start, end) => ({
  type: types.FILTER_AGENDAMENTOS,
  payload: { start, end },
});

// ── Criar ──────────────────────────────────────────────────────────────────
export const createAgendamento = (dados) => ({
  type: types.CREATE_AGENDAMENTO,
  payload: dados,
});

// ── Editar ─────────────────────────────────────────────────────────────────
export const updateAgendamento = (id, dados) => ({
  type: types.UPDATE_AGENDAMENTO,
  payload: { id, dados },
});

// ── Deletar ────────────────────────────────────────────────────────────────
export const deleteAgendamento = (id) => ({
  type: types.DELETE_AGENDAMENTO,
  payload: { id },
});
