import types from "./types";
import {produce} from "immer";

const INITIAL = {
  agendamentos: [],
};

export default function reducer(state = INITIAL, action) {
  console.log("ACTION:", action.type);

  switch (action.type) {

    case types.UPDATE_AGENDAMENTOS: {
      return produce(state, draft => {
        draft.agendamentos = action.payload.agendamentos;
      });
    }

    case types.FILTER_AGENDAMENTOS_SUCCESS: {
      const eventos = action.payload.agendamentos || [];

      return produce(state, draft => {
        draft.agendamentos = eventos;
      });
    }

    default:
      return state;
  }
}
