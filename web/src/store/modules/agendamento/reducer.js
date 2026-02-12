const INITIAL_SATATE = {
    agendamentos: [],
}

function agendamentoReducer(state = INITIAL_SATATE, action) {
    switch (action.type) {
        case '@agendamento/ALL':
            return {
                ...state,
                agendamentos: action.payload,
            }
        default:
            return state
    }
}
export default agendamentoReducer