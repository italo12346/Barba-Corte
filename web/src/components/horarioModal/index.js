import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, SelectPicker, CheckboxGroup, Checkbox, Form } from "rsuite";
import { createHorario, updateHorario } from "../../store/modules/horario/actions";
import { allColaboradores } from "../../store/modules/colaboradores/actions";

/**
 * HorarioFormModal
 *
 * Props:
 *  - open        : boolean
 *  - onClose     : () => void
 *  - horario     : objeto para edição (null = criação)
 *  - slotInicial : { diasSemana, horaInicio, horaFim } ao clicar no calendário
 */

const DIAS_OPTIONS = [
  { label: "Domingo",       value: 0 },
  { label: "Segunda-feira", value: 1 },
  { label: "Terça-feira",   value: 2 },
  { label: "Quarta-feira",  value: 3 },
  { label: "Quinta-feira",  value: 4 },
  { label: "Sexta-feira",   value: 5 },
  { label: "Sábado",        value: 6 },
];

const FORM_INICIAL = {
  colaboradorId: "",
  diasSemana:    [],
  horaInicio:    "",
  horaFim:       "",
};

const HorarioFormModal = ({
  open,
  onClose,
  horario     = null,
  slotInicial = null,
}) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.horario);

  const listaColaboradores = useSelector((s) => s.colaborador?.lista || []);

  const [form, setForm] = useState(FORM_INICIAL);

  const colaboradoresOptions = useMemo(
    () => listaColaboradores.map((c) => ({ label: c.nome, value: c._id })),
    [listaColaboradores]
  );

  // ── Carrega colaboradores ao abrir ───────────────────────────────────────
  useEffect(() => {
    if (open) dispatch(allColaboradores());
  }, [open, dispatch]);

  // ── Preenche formulário ao editar ou ao clicar num slot ──────────────────
  useEffect(() => {
    if (!open) return;

    if (horario) {
      setForm({
        colaboradorId: horario.colaboradorId || "",
        diasSemana:    [horario.diaSemana]   || [],
        horaInicio:    horario.horaInicio    || "",
        horaFim:       horario.horaFim       || "",
      });
    } else {
      setForm({
        ...FORM_INICIAL,
        diasSemana: slotInicial?.diasSemana || [],
        horaInicio: slotInicial?.horaInicio || "",
        horaFim:    slotInicial?.horaFim    || "",
      });
    }
  }, [horario, slotInicial, open]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!formValido) return;

    const payload = { ...form };

    if (horario) {
      dispatch(updateHorario(horario.horarioId, payload, onClose)); // 👈 onClose como callback
    } else {
      dispatch(createHorario({ ...payload, onSuccess: onClose }));  // 👈 onClose como callback
    }
  };

  const formValido =
    form.colaboradorId &&
    form.diasSemana.length > 0 &&
    form.horaInicio &&
    form.horaFim;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal open={open} onClose={onClose} size="sm" className="agendamento-modal">
      <Modal.Header className="modalHeader">
        <Modal.Title className="color-w">
          {horario ? "Editar Horário" : "Novo Horário de Trabalho"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form fluid>

          {/* COLABORADOR */}
          <Form.Group>
            <Form.Label>Colaborador</Form.Label>
            <SelectPicker
              block
              data={colaboradoresOptions}
              value={form.colaboradorId}
              onChange={(val) => setForm((f) => ({ ...f, colaboradorId: val || "" }))}
              placeholder="Selecione o colaborador"
            />
          </Form.Group>

          {/* DIAS DA SEMANA */}
          <Form.Group>
            <Form.Label>Dias da semana</Form.Label>
            <CheckboxGroup
              inline
              value={form.diasSemana}
              onChange={(vals) => setForm((f) => ({ ...f, diasSemana: vals }))}
            >
              {DIAS_OPTIONS.map((d) => (
                <Checkbox key={d.value} value={d.value}>
                  {d.label}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </Form.Group>

          {/* HORA INÍCIO */}
          <Form.Group>
            <Form.Label>Hora de início</Form.Label>
            <input
              type="time"
              className="rs-input"
              value={form.horaInicio}
              onChange={(e) => setForm((f) => ({ ...f, horaInicio: e.target.value }))}
            />
          </Form.Group>

          {/* HORA FIM */}
          <Form.Group>
            <Form.Label>Hora de término</Form.Label>
            <input
              type="time"
              className="rs-input"
              value={form.horaFim}
              onChange={(e) => setForm((f) => ({ ...f, horaFim: e.target.value }))}
            />
          </Form.Group>

        </Form>
      </Modal.Body>

      <Modal.Footer className="agendamento-footer">
        <div className="row g-2 w-100">
          <div className="col-6">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
          <div className="col-6">
            <button
              className="btn agendamento-btn w-100"
              onClick={handleSubmit}
              disabled={!formValido || loading}
            >
              {loading ? "Salvando..." : horario ? "Salvar" : "Criar horário"}
            </button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default HorarioFormModal;