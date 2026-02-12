import { combineReducers } from "redux";
import agendamentoReducer from "./modules/agendamento/reducer";

const rootReducer = combineReducers({
    agendamento: agendamentoReducer,
})

export default rootReducer