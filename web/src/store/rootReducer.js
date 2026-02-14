import { combineReducers } from "redux";
import agendamentoReducer from "./modules/agendamento/reducer";
import clienteReducer from "./modules/cliente/reducer";

const rootReducer = combineReducers({
  agendamento: agendamentoReducer,
  cliente: clienteReducer,
});

export default rootReducer;