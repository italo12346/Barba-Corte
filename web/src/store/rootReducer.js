import { combineReducers } from "redux";
import agendamentoReducer from "./modules/agendamento/reducer";
import clienteReducer from "./modules/cliente/reducer";
import cadastroReducer from "./modules/cadastro/reducer";
import colaborador from "./modules/colaboradores/reducer";
import servico from "./modules/servico/reducer";
import horario from "./modules/horario/reducer";
import authReducer from "./modules/auth/authReducer";
import profileReducer from "./modules/perfil/reducer"; 

const rootReducer = combineReducers({
  agendamento: agendamentoReducer,
  cliente: clienteReducer,
  cadastro: cadastroReducer,
  colaborador,
  servico,
  horario,
  auth: authReducer,
  perfil: profileReducer, 
});

export default rootReducer;