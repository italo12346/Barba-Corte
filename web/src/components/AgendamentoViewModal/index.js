import { useState } from "react";
import { Modal } from "rsuite";
import { useDispatch } from "react-redux";
import types from "../../store/modules/agendamento/types";

/**
 * AgendamentoViewModal
 *
 * Props:
 *  - open            : boolean
 *  - onClose         : () => void
 *  - agendamento     : objeto completo
 *  - onEditar        : (agendamento) => void  — abre o FormModal em modo edição
 */
const AgendamentoViewModal = ({ open, onClose, agendamento, onEditar }) => {
  const dispatch = useDispatch();
  const [confirmandoDeletar, setConfirmandoDeletar] = useState(false);

  if (!agendamento) return null;

  // ── Formatadores ────────────────────────────────────────────────────────
  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleString("pt-BR", {
      day:    "2-digit",
      month:  "2-digit",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    });
  };

  const formatarValor = (valor) => {
    if (valor === undefined || valor === null) return "Não informado";
    return `R$ ${Number(valor).toFixed(2)}`;
  };

  // ── Ações ────────────────────────────────────────────────────────────────
  const handleEditar = () => {
    onClose();
    onEditar(agendamento);
  };

  const handleDeletar = () => {
    dispatch({ type: types.DELETE_AGENDAMENTO, payload: { id: agendamento._id } });
    setConfirmandoDeletar(false);
    onClose();
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onClose={() => {
        setConfirmandoDeletar(false);
        onClose();
      }}
      size="md"
      className="agendamento-modal"
    >
      {/* HEADER */}
      <Modal.Header className="modalHeader">
        <Modal.Title className="color-w">
          Detalhes do Agendamento
        </Modal.Title>
      </Modal.Header>

      {/* BODY */}
      <Modal.Body>
        <div className="container-fluid">

          {/* SERVIÇO */}
          <div className="agendamento-card card-body mb-3">
            <div className="agendamento-label">Serviço</div>
            <div className="agendamento-value">
              {agendamento.servicoId?.titulo || "-"}
            </div>
          </div>

          <div className="row">

            {/* CLIENTE */}
            <div className="col-md-6 mb-3">
              <div className="agendamento-card card-body h-100">
                <div className="agendamento-label">Cliente</div>
                <div className="agendamento-value">
                  {agendamento.clienteId?.nome || "-"}
                </div>
              </div>
            </div>

            {/* COLABORADOR */}
            <div className="col-md-6 mb-3">
              <div className="agendamento-card card-body h-100">
                <div className="agendamento-label">Colaborador</div>
                <div className="agendamento-value">
                  {agendamento.colaboradorId?.nome || "-"}
                </div>
              </div>
            </div>

          </div>

          <div className="row">

            {/* DATA */}
            <div className="col-md-6 mb-3">
              <div className="agendamento-card card-body h-100">
                <div className="agendamento-label">Data</div>
                <div className="agendamento-value">
                  {formatarData(agendamento.dataAgendamento)}
                </div>
              </div>
            </div>

            {/* VALOR */}
            <div className="col-md-6 mb-3">
              <div className="agendamento-card card-body h-100">
                <div className="agendamento-label">Valor</div>
                <div className="agendamento-valor">
                  {formatarValor(agendamento.valorServico)}
                </div>
              </div>
            </div>

          </div>

          {/* STATUS */}
          <div className="agendamento-card card-body text-center">
            <div className="agendamento-label">Status</div>
            <div className="mt-2">
              <span className={`status-badge pb-1 status-${agendamento.status}`}>
                {agendamento.status || "pendente"}
              </span>
            </div>
          </div>

          {/* CONFIRMAÇÃO DE DELEÇÃO */}
          {confirmandoDeletar && (
            <div className="alert alert-danger mt-3 mb-0 text-center">
              <p className="mb-2 fw-semibold">Deseja realmente remover este agendamento?</p>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleDeletar}
                >
                  Sim, remover
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setConfirmandoDeletar(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

        </div>
      </Modal.Body>

      {/* FOOTER */}
      <Modal.Footer className="agendamento-footer">
        {!confirmandoDeletar ? (
          <div className="row g-2 w-100">

            {/* Fechar */}
            <div className="col-4">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={onClose}
              >
                Fechar
              </button>
            </div>

            {/* Editar */}
            <div className="col-4">
              <button
                className="btn agendamento-btn w-100"
                onClick={handleEditar}
              >
                Editar
              </button>
            </div>

            {/* Deletar */}
            <div className="col-4">
              <button
                className="btn btn-danger w-100"
                onClick={() => setConfirmandoDeletar(true)}
              >
                Deletar
              </button>
            </div>

          </div>
        ) : (
          /* Quando confirmando, footer fica vazio pois o alerta já tem os botões */
          <div />
        )}
      </Modal.Footer>

    </Modal>
  );
};

export default AgendamentoViewModal;
