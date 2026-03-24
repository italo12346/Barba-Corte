import { combineReducers } from "redux";
import agendamentoReducer from "./modules/agendamento/reducer";
import clienteReducer from "./modules/cliente/reducer";
import authReducer from "./modules/login/reducer";
import cadastroReducer from "./modules/cadastro/reducer";
import colaborador from "./modules/colaboradores/reducer";
import servico from "./modules/servico/reducer";
import horario from "./modules/horario/reducer";

const rootReducer = combineReducers({
  agendamento: agendamentoReducer,
  cliente: clienteReducer,
  auth: authReducer,
  cadastro:cadastroReducer,
  colaborador:colaborador,
  servico,
   horario
});

export default rootReducer;
