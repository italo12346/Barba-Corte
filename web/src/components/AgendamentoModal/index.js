import { Modal } from "rsuite";

const AgendamentoModal = ({ open, onClose, agendamento }) => {
  if (!agendamento) return null;

  // =============================
  // FORMATADORES
  // =============================

  const formatarData = (data) => {
    if (!data) return "-";

    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatarValor = (valor) => {
    if (valor === undefined || valor === null)
      return "Não informado";

    return `R$ ${Number(valor).toFixed(2)}`;
  };

  // =============================
  // RENDER
  // =============================

  return (
    <Modal
      open={open}
      onClose={onClose}
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
            <div className="agendamento-label">
              Serviço
            </div>

            <div className="agendamento-value">
              {agendamento.servicoId?.titulo || "-"}
            </div>
          </div>

          <div className="row">

            {/* CLIENTE */}
            <div className="col-md-6 mb-3">
              <div className="agendamento-card card-body h-100">
                <div className="agendamento-label">
                  Cliente
                </div>

                <div className="agendamento-value">
                  {agendamento.clienteId?.nome || "-"}
                </div>
              </div>
            </div>

            {/* COLABORADOR */}
            <div className="col-md-6 mb-3">
              <div className="agendamento-card card-body h-100">
                <div className="agendamento-label">
                  Colaborador
                </div>

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
                <div className="agendamento-label">
                  Data
                </div>

                <div className="agendamento-value">
                  {formatarData(
                    agendamento.dataAgendamento
                  )}
                </div>
              </div>
            </div>

            {/* VALOR */}
            <div className="col-md-6 mb-3">
              <div className="agendamento-card card-body h-100">
                <div className="agendamento-label">
                  Valor
                </div>

                <div className="agendamento-valor">
                  {formatarValor(
                    agendamento.valorServico
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* STATUS */}
          <div className="agendamento-card card-body text-center">
            <div className="agendamento-label">
              Status
            </div>

            <div className="mt-2">
              <span
                className={`status-badge pb-1 status-${agendamento.status}`}
              >
                {agendamento.status || "status-pendente"}
              </span>
            </div>
          </div>

        </div>
      </Modal.Body>

      {/* FOOTER */}
      <Modal.Footer className="agendamento-footer">
        <button
          className="btn agendamento-btn w-100"
          onClick={onClose}
        >
          Fechar
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AgendamentoModal;
