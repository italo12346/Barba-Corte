import { Modal } from "rsuite";

const ClienteModal = ({
  open,
  onClose,
  cliente,
  agendamentos = [],
  loading = false,
}) => {
  if (!cliente) return null;

  // =========================
  // FORMATAR DATA
  // =========================
  const formatarData = (data) => {
    if (!data) return "-";

    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // =========================
  // FORMATAR TELEFONE
  // =========================
  const formatarTelefone = (telefone) => {
    if (!telefone) return "-";

    const numeros = telefone.replace(/\D/g, "");

    if (numeros.length === 11) {
      return numeros.replace(
        /^(\d{2})(\d{5})(\d{4})$/,
        "($1) $2-$3"
      );
    }

    if (numeros.length === 10) {
      return numeros.replace(
        /^(\d{2})(\d{4})(\d{4})$/,
        "($1) $2-$3"
      );
    }

    return telefone;
  };

  // =========================
  // BADGE STATUS DINÂMICO
  // =========================
  const getStatusBadge = (status) => {
    const map = {
      confirmado: "bg-success",
      pendente: "bg-warning text-dark",
      cancelado: "bg-danger",
      concluido: "bg-primary",
    };

    return map[status] || "bg-secondary";
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <Modal.Header>
        <Modal.Title>
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center"
              style={{ width: 50, height: 50, fontSize: 20 }}
            >
              {cliente.nome?.charAt(0)}
            </div>

            <div>
              <h5 className="mb-0">{cliente.nome}</h5>
              <small className="text-muted">{cliente.email}</small>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-dark" />
          </div>
        )}

        {!loading && (
          <div className="container-fluid">
            {/* =========================
               DADOS DO CLIENTE
            ========================== */}
            <div className="card shadow-sm mb-4">
              <div className="card-header text-white">
                Dados do Cliente
              </div>

              <div className="card-body row g-3">
                <Info
                  label="Telefone"
                  value={formatarTelefone(cliente.telefone)}
                />
                <Info label="Sexo" value={cliente.sexo} />
                <Info
                  label="Nascimento"
                  value={formatarData(cliente.dataNascimento)}
                />
                <Info label="Documento" value={cliente.documento?.numero} />
                <Info label="Cidade" value={cliente.endereco?.cidade} />
              </div>
            </div>

            {/* =========================
               HISTÓRICO DE AGENDAMENTOS
            ========================== */}
            <div className="card shadow-sm">
              <div className="card-header bg-dark text-white">
                Histórico de Agendamentos
              </div>

              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Serviço</th>
                      <th>Colaborador</th>
                      <th>Data</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {agendamentos.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-3">
                          Nenhum agendamento encontrado
                        </td>
                      </tr>
                    )}

                    {agendamentos.map((a) => (
                      <tr key={a._id}>
                        <td>{a.servico || "-"}</td>
                        <td>{a.colaborador || "-"}</td>
                        <td>{formatarData(a.data)}</td>
                        <td>
                          {a.valor
                            ? `R$ ${Number(a.valor).toFixed(2)}`
                            : "-"}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(a.status)}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-ha" onClick={onClose}>
          Fechar
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClienteModal;

/* =========================
   COMPONENTE AUXILIAR
========================= */

const Info = ({ label, value }) => (
  <div className="col-md-4">
    <small className="text-muted">{label}</small>
    <div className="fw-semibold">{value || "-"}</div>
  </div>
);
