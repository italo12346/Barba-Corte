import moment from "moment";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker, Modal, SelectPicker } from "rsuite";
import consts from "../../consts/consts";
import types from "../../store/modules/agendamento/types";
import clienteTypes from "../../store/modules/cliente/types";
import colaboradorTypes from "../../store/modules/colaboradores/types";
import servicoTypes from "../../store/modules/servico/types";

const EMPTY = [];

const AgendamentoFormModal = ({
  open,
  onClose,
  agendamento = null,
  slotInicial = null,
}) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((s) => s.agendamento);

  const servicos     = useSelector((s) => s.servico?.lista       || EMPTY);
  const clientes     = useSelector((s) => s.cliente?.data        || EMPTY);
  const colaboradores = useSelector((s) => s.colaborador?.lista  || EMPTY);

  const [form, setForm] = useState({
    servicoId: null,
    clienteId: null,
    colaboradorId: null,
    dataAgendamento: null,
    status: "aguardando_pagamento",
  });

  const [errors, setErrors] = useState({});

  // ✅ 1) Carrega as listas sempre que o modal abre
  useEffect(() => {
    if (open) {
      dispatch({ type: servicoTypes.LIST_SERVICOS_REQUEST,      payload: consts.salaoId });
      dispatch({ type: clienteTypes.GET_CLIENTES_REQUEST,       payload: consts.salaoId });
      dispatch({ type: colaboradorTypes.LIST_COLABORADORES_REQUEST, payload: consts.salaoId });
    }
  }, [open, dispatch]);

  // ✅ 2) Fecha o modal apenas quando a operação for bem-sucedida
  useEffect(() => {
    if (success && open) {
      onClose();
    }
  }, [success, open, dispatch, onClose]);

  // ── Preenche formulário ao editar ou ao clicar num slot ──────────────────
  useEffect(() => {
    if (agendamento) {
      setForm({
        servicoId:      agendamento.servicoId?._id      ?? agendamento.servicoId      ?? null,
        clienteId:      agendamento.clienteId?._id      ?? agendamento.clienteId      ?? null,
        colaboradorId:  agendamento.colaboradorId?._id  ?? agendamento.colaboradorId  ?? null,
        dataAgendamento: agendamento.dataAgendamento
          ? new Date(agendamento.dataAgendamento)
          : null,
        status: agendamento.status ?? "aguardando_pagamento",
      });
    } else {
      setForm({
        servicoId: null,
        clienteId: null,
        colaboradorId: null,
        dataAgendamento: slotInicial ? new Date(slotInicial) : null,
        status: "aguardando_pagamento",
      });
    }
    setErrors({});
  }, [agendamento, slotInicial, open]);

  // ✅ Filtra colaboradores que têm o serviço selecionado nas especialidades
  const colaboradoresFiltrados = useMemo(() => {
    if (!form.servicoId) return [];
    return colaboradores.filter((c) =>
      c.especialidades?.some(
        (espId) => espId?.toString() === form.servicoId?.toString()
      )
    );
  }, [form.servicoId, colaboradores]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toPickerData = (lista, labelKey = "nome") =>
    lista.map((item) => ({ label: item[labelKey], value: item._id }));

  const set = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Ao trocar o serviço, limpa o colaborador se ele não atende o novo serviço
  const handleServicoChange = (value) => {
    setForm((prev) => {
      const colaboradorAindaValido = colaboradores
        .find((c) => c._id === prev.colaboradorId)
        ?.especialidades?.some((espId) => espId?.toString() === value?.toString());

      return {
        ...prev,
        servicoId: value,
        colaboradorId: colaboradorAindaValido ? prev.colaboradorId : null,
      };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.servicoId)       e.servicoId       = "Selecione o serviço";
    if (!form.clienteId)       e.clienteId       = "Selecione o cliente";
    if (!form.colaboradorId)   e.colaboradorId   = "Selecione o colaborador";
    if (!form.dataAgendamento) e.dataAgendamento = "Informe a data";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      ...form,
      dataAgendamento: moment(form.dataAgendamento).toISOString(),
    };

    if (agendamento) {
      dispatch({ type: types.UPDATE_AGENDAMENTO, payload: { id: agendamento._id, dados: payload } });
    } else {
      dispatch({ type: types.CREATE_AGENDAMENTO, payload });
    }
  };

  const statusOptions = [
    { label: "Pendente",   value: "aguardando_pagamento" },
    { label: "Confirmado", value: "confirmado" },
    { label: "Cancelado",  value: "cancelado" },
    { label: "Concluído",  value: "concluido" },
  ];

  return (
    <Modal open={open} onClose={onClose} size="md" className="agendamento-modal">
      <Modal.Header className="modalHeader">
        <Modal.Title className="color-w">
          {agendamento ? "Editar Agendamento" : "Novo Agendamento"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="container-fluid">
          {/* SERVIÇO */}
          <div className="mb-3">
            <label className="agendamento-label">Serviço</label>
            <SelectPicker
              data={toPickerData(servicos, "titulo")}
              value={form.servicoId}
              onChange={handleServicoChange}
              placeholder="Selecione o serviço"
              block
              className={errors.servicoId ? "is-invalid" : ""}
            />
            {errors.servicoId && (
              <div className="invalid-feedback d-block">{errors.servicoId}</div>
            )}
          </div>

          <div className="row">
            {/* CLIENTE */}
            <div className="col-md-6 mb-3">
              <label className="agendamento-label">Cliente</label>
              <SelectPicker
                data={toPickerData(clientes)}
                value={form.clienteId}
                onChange={set("clienteId")}
                placeholder="Selecione o cliente"
                block
                className={errors.clienteId ? "is-invalid" : ""}
              />
              {errors.clienteId && (
                <div className="invalid-feedback d-block">{errors.clienteId}</div>
              )}
            </div>

            {/* COLABORADOR — filtrado pelo serviço */}
            <div className="col-md-6 mb-3">
              <label className="agendamento-label">Colaborador</label>
              <SelectPicker
                data={toPickerData(colaboradoresFiltrados)}
                value={form.colaboradorId}
                onChange={set("colaboradorId")}
                placeholder={
                  !form.servicoId
                    ? "Selecione um serviço primeiro"
                    : colaboradoresFiltrados.length === 0
                    ? "Nenhum colaborador disponível"
                    : "Selecione o colaborador"
                }
                disabled={!form.servicoId}
                block
                className={errors.colaboradorId ? "is-invalid" : ""}
              />
              {errors.colaboradorId && (
                <div className="invalid-feedback d-block">{errors.colaboradorId}</div>
              )}
            </div>
          </div>

          {/* DATA */}
          <div className="mb-3">
            <label className="agendamento-label">Data e Hora</label>
            <DatePicker
              format="dd/MM/yyyy HH:mm"
              value={form.dataAgendamento}
              onChange={set("dataAgendamento")}
              placeholder="Selecione data e hora"
              block
              className={errors.dataAgendamento ? "is-invalid" : ""}
            />
            {errors.dataAgendamento && (
              <div className="invalid-feedback d-block">{errors.dataAgendamento}</div>
            )}
          </div>

          {/* STATUS — só aparece na edição */}
          {agendamento && (
            <div className="mb-3">
              <label className="agendamento-label">Status</label>
              <SelectPicker
                data={statusOptions}
                value={form.status}
                onChange={set("status")}
                searchable={false}
                block
              />
            </div>
          )}
        </div>
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
              disabled={loading}
            >
              {loading ? "Salvando..." : agendamento ? "Salvar" : "Agendar"}
            </button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AgendamentoFormModal;