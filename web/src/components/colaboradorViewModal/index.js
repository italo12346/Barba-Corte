import { Modal } from "rsuite";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadServicosColaborador } from "../../store/modules/colaboradores/actions";
import { formatarTelefone, formatarData } from "../../util/functionAux";

const ColaboradorViewModal = ({
  open,
  onClose,
  colaborador,
  loading = false,
}) => {
  const dispatch = useDispatch();

  const { servicosColaborador = {}, loadingServicosColaborador } = useSelector(
    (state) => state.colaborador,
  );

  // =========================================
  // CARREGAR SERVIÇOS DO COLABORADOR
  // =========================================
  useEffect(() => {
    if (!colaborador?.especialidades?.length) return;

    const faltando = colaborador.especialidades.filter(
      (id) => !servicosColaborador[id],
    );

    if (faltando.length) {
      dispatch(loadServicosColaborador(faltando));
    }
  }, [colaborador?.especialidades, servicosColaborador, dispatch]);

  const servicosMap = useMemo(() => {
    return servicosColaborador || {};
  }, [servicosColaborador]);

  if (!colaborador) return null;

  console.log("especialidades:", colaborador.especialidades);
  console.log("servicosMap:", servicosMap);

  // =========================================
  // FORMATADORES
  // =========================================

  const getStatusBadge = (status) => {
    const map = { A: "bg-success", I: "bg-danger" };
    return map[status] || "bg-secondary";
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <Modal.Header>
        <Modal.Title>
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center bg-dark text-white"
              style={{ width: 60, height: 60, fontSize: 22 }}
            >
              {colaborador.foto ? (
                <img
                  src={colaborador.foto}
                  alt={colaborador.nome}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                colaborador.nome?.charAt(0)
              )}
            </div>

            <div>
              <h5 className="mb-0">{colaborador.nome}</h5>
              <small className="text-muted">{colaborador.email}</small>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {(loading || loadingServicosColaborador) && (
          <div className="text-center py-4">
            <div className="spinner-border text-dark" />
          </div>
        )}

        {!loading && !loadingServicosColaborador && (
          <div className="container-fluid">
            {/* DADOS */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-dark text-white">
                Dados do Colaborador
              </div>
              <div className="card-body row g-3">
                <Info
                  label="Telefone"
                  value={formatarTelefone(colaborador.telefone)}
                />
                <Info label="Sexo" value={colaborador.sexo} />
                <Info
                  label="Nascimento"
                  value={formatarData(colaborador.dataNascimento)}
                />
                <Info label="Cadastro" value={colaborador.dataCadastro} />
                <Info
                  label="Status"
                  value={
                    <span
                      className={`badge ${getStatusBadge(colaborador.status)}`}
                    >
                      {colaborador.status === "A" ? "Ativo" : "Inativo"}
                    </span>
                  }
                />
              </div>
            </div>

            {/* MERCADO PAGO */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-dark text-white">Mercado Pago</div>
              <div className="card-body">
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

            {/* ESPECIALIDADES */}
            <div className="card shadow-sm">
              <div className="card-header bg-dark text-white">
                Especialidades
              </div>
              <div className="card-body">
                {!colaborador.especialidades?.length && (
                  <div className="text-muted">
                    Nenhuma especialidade cadastrada
                  </div>
                )}

                {colaborador.especialidades?.map((id) => {
                  const servico = servicosMap[id];

                  return (
                    <span key={id} className="badge bg-secondary me-2 mb-2">
                      {servico?.titulo || "Carregando..."}
                    </span>
                  );
                })}
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

export default ColaboradorViewModal;

const Info = ({ label, value }) => (
  <div className="col-md-4">
    <small className="text-muted">{label}</small>
    <div className="fw-semibold">{value || "-"}</div>
  </div>
);
