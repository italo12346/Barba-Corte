const formatarCPF = (value = "") => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatarTelefone = (telefone) => {
  if (!telefone) return "";
  const n = telefone.replace(/\D/g, "");
  if (n.length === 11)
    return n.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  if (n.length === 10)
    return n.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return telefone;
};
const formatarData = (data) => {
  if (!data) return "-";

  // 🔥 Caso já seja Date
  if (data instanceof Date && !isNaN(data)) {
    return data.toLocaleDateString("pt-BR");
  }

  // 🔥 ISO ou timestamp
  const iso = new Date(data);
  if (!isNaN(iso.getTime())) {
    return iso.toLocaleDateString("pt-BR");
  }

  // 🔥 Formato BR (dd/MM/yyyy)
  if (typeof data === "string" && data.includes("/")) {
    const [dia, mes, ano] = data.split("/");
    const br = new Date(`${ano}-${mes}-${dia}`);
    if (!isNaN(br.getTime())) {
      return br.toLocaleDateString("pt-BR");
    }
  }

  // fallback seguro
  return "-";
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
  minutosParaDate,
  formatarCPF,
};
