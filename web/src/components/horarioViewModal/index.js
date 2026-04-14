import { useState } from "react";
import { Modal } from "rsuite";
import { useDispatch } from "react-redux";
import { deleteHorario } from "../../store/modules/horario/actions";

/**
 * HorarioViewModal
 *
 * Props:
 *  - open        : boolean
 *  - onClose     : () => void
 *  - horario     : objeto completo
 *  - onEditar    : (horario) => void — abre o FormModal em modo edição
 */

const DIAS_SEMANA = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

const HorarioViewModal = ({ open, onClose, horario, onEditar }) => {
  const dispatch = useDispatch();
  const [confirmandoDeletar, setConfirmandoDeletar] = useState(false);

  if (!horario) return null;

  // ── Ações ────────────────────────────────────────────────────────────────
  const handleEditar = () => {
    onClose();
    onEditar(horario);
  };

  const handleDeletar = () => {
    // IMPORTANTE: Extrair apenas o ID (string) para evitar enviar o objeto inteiro [object Object]
    // No seu reducer/saga, o campo pode ser 'id' ou 'horarioId' ou '_id'
    const idParaDeletar = horario.id || horario.horarioId || horario._id;
    
    if (idParaDeletar && typeof idParaDeletar === 'string') {
      dispatch(deleteHorario(idParaDeletar));
      setConfirmandoDeletar(false);
      onClose();
    } else if (idParaDeletar && typeof idParaDeletar === 'object' && idParaDeletar._id) {
        // Caso o ID ainda venha como objeto do MongoDB
        dispatch(deleteHorario(idParaDeletar._id));
        setConfirmandoDeletar(false);
        onClose();
    } else {
      console.error("ID inválido para exclusão:", idParaDeletar);
      alert("Erro: ID do horário não encontrado ou inválido.");
    }
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
          Detalhes do Horário
        </Modal.Title>
      </Modal.Header>

      {/* BODY */}
      <Modal.Body>
        <div className="container-fluid">

          {/* COLABORADOR */}
          <div className="agendamento-card card-body mb-3">
            <div className="agendamento-label">Colaborador</div>
            <div className="agendamento-value">
              {horario.colaboradorNome || "Sem colaborador"}
            </div>
          </div>

          <div className="row">

            {/* DIA DA SEMANA */}
            <div className="col-md-6 mb-3">
              <div className="agendamento-card card-body h-100">
                <div className="agendamento-label">Dia da Semana</div>
                <div className="agendamento-value">
                  {DIAS_SEMANA[horario.diaSemana] || "-"}
                </div>
              </div>
            </div>

            {/* HORÁRIO */}
            <div className="col-md-6 mb-3">
              <div className="agendamento-card card-body h-100">
                <div className="agendamento-label">Horário</div>
                <div className="agendamento-value">
                  {horario.horaInicio} às {horario.horaFim}
                </div>
              </div>
            </div>

          </div>

          {/* CONFIRMAÇÃO DE DELEÇÃO */}
          {confirmandoDeletar && (
            <div className="alert alert-danger mt-3 mb-0 text-center">
              <p className="mb-2 fw-semibold">Deseja realmente remover este horário?</p>
              <div className="d-flex gap-2 justify-content-center">
                <button className="btn btn-danger btn-sm" onClick={handleDeletar}>
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

            <div className="col-4">
              <button className="btn btn-outline-secondary w-100" onClick={onClose}>
                Fechar
              </button>
            </div>

            <div className="col-4">
              <button className="btn agendamento-btn w-100" onClick={handleEditar}>
                Editar
              </button>
            </div>

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
          <div />
        )}
      </Modal.Footer>

    </Modal>
  );
};

export default HorarioViewModal;
