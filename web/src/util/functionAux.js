
const formatarTelefone = (telefone) => {
  if (!telefone) return "";
  const n = telefone.replace(/\D/g, "");
  if (n.length === 11) return n.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  if (n.length === 10) return n.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return telefone;
};
  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };
const minutosParaDate = (min) => {
  const date = new Date();
  date.setHours(Math.floor(min / 60));
  date.setMinutes(min % 60);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

const formatarDuracao = (min) => {
  if (!min || min <= 0) return "-";

  const horas = Math.floor(min / 60);
  const minutos = min % 60;

  if (horas > 0 && minutos > 0) {
    return `${horas}h ${minutos}min`;
  }

  if (horas > 0) {
    return `${horas}h`;
  }

  return `${minutos}min`;
};


module.exports = {
  formatarData,
  formatarTelefone,
  formatarDuracao,
  minutosParaDate
};