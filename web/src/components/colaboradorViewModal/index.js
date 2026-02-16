import { Modal } from "rsuite";
import { useSelector } from "react-redux";

const ColaboradorViewModal = ({
  open,
  onClose,
  colaborador,
  loading = false,
}) => {
  const { servicos } = useSelector(
    (state) => state.colaborador
  );

  if (!colaborador) return null;

  // =========================================
  // CRIAR MAPA DE SERVIÇOS (PERFORMÁTICO)
  // =========================================
  const servicosMap = Object.fromEntries(
    servicos.map((s) => [s._id, s])
  );

  // =========================================
  // FORMATAR DATA
  // =========================================
  const formatarData = (data) => {
    if (!data) return "-";

    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // =========================================
  // FORMATAR TELEFONE
  // =========================================
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

  // =========================================
  // BADGE STATUS
  // =========================================
  const getStatusBadge = (status) => {
    const map = {
      A: "bg-success",
      I: "bg-danger",
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
              {colaborador.nome?.charAt(0)}
            </div>

            <div>
              <h5 className="mb-0">{colaborador.nome}</h5>
              <small className="text-muted">
                {colaborador.email}
              </small>
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
               DADOS DO COLABORADOR
            ========================== */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-dark text-white">
                Dados do Colaborador
              </div>

              <div className="card-body row g-3">
                <Info
                  label="Telefone"
                  value={formatarTelefone(
                    colaborador.telefone
                  )}
                />
                <Info label="Sexo" value={colaborador.sexo} />
                <Info
                  label="Nascimento"
                  value={formatarData(
                    colaborador.dataNascimento
                  )}
                />
                <Info
                  label="Cadastro"
                  value={colaborador.dataCadastro}
                />
                <Info
                  label="Status"
                  value={
                    <span
                      className={`badge ${getStatusBadge(
                        colaborador.status
                      )}`}
                    >
                      {colaborador.status === "A"
                        ? "Ativo"
                        : "Inativo"}
                    </span>
                  }
                />
              </div>
            </div>

            {/* =========================
               MERCADO PAGO
            ========================== */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-dark text-white">
                Mercado Pago
              </div>

              <div className="card-body row g-3">
                <Info
                  label="Status da Conta"
                  value={
                    colaborador.mercadoPago?.connected
                      ? "Conectado"
                      : "Não conectado"
                  }
                />
              </div>
            </div>

            {/* =========================
               ESPECIALIDADES
            ========================== */}
            <div className="card shadow-sm">
              <div className="card-header bg-dark text-white">
                Especialidades
              </div>

              <div className="card-body">
                {colaborador.especialidades?.length === 0 && (
                  <div className="text-muted">
                    Nenhuma especialidade cadastrada
                  </div>
                )}

                {colaborador.especialidades?.map((id) => (
                  <span
                    key={id}
                    className="badge bg-secondary me-2 mb-2"
                  >
                    {servicosMap[id]?.titulo || id}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button
          className="btn btn-ha"
          onClick={onClose}
        >
          Fechar
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ColaboradorViewModal;

/* =========================
   COMPONENTE AUXILIAR
========================= */

const Info = ({ label, value }) => (
  <div className="col-md-4">
    <small className="text-muted">{label}</small>
    <div className="fw-semibold">
      {value || "-"}
    </div>
  </div>
);
