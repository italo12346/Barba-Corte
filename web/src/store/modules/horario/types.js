const Types = {
  // ── Listar ──────────────────────────────────────────
  ALL_HORARIOS_REQUEST: "horario/ALL_HORARIOS_REQUEST",
  ALL_HORARIOS_SUCCESS: "horario/ALL_HORARIOS_SUCCESS",
  ALL_HORARIOS_FAILURE: "horario/ALL_HORARIOS_FAILURE",

  // ── Criar ────────────────────────────────────────────
  CREATE_HORARIO_REQUEST: "horario/CREATE_HORARIO_REQUEST",
  CREATE_HORARIO_SUCCESS: "horario/CREATE_HORARIO_SUCCESS",
  CREATE_HORARIO_FAILURE: "horario/CREATE_HORARIO_FAILURE",

  // ── Atualizar (pronto para quando a API tiver PUT) ───
  UPDATE_HORARIO_REQUEST: "horario/UPDATE_HORARIO_REQUEST",
  UPDATE_HORARIO_SUCCESS: "horario/UPDATE_HORARIO_SUCCESS",
  UPDATE_HORARIO_FAILURE: "horario/UPDATE_HORARIO_FAILURE",

  // ── UI / Modal ───────────────────────────────────────
  OPEN_HORARIO_MODAL: "horario/OPEN_HORARIO_MODAL",
  CLOSE_HORARIO_MODAL: "horario/CLOSE_HORARIO_MODAL",

  // ── View do calendário ───────────────────────────────
  SET_CALENDAR_VIEW: "horario/SET_CALENDAR_VIEW",
};

export default Types;
