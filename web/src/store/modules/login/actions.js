export const loginRequest = (email, senha) => (dispatch) => {
  dispatch({ type: "LOGIN_REQUEST" });

  setTimeout(() => {
    dispatch({
      type: "LOGIN_SUCCESS"
    });
  }, 800); // simula delay da API
};
