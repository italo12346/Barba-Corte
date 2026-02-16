import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Form, SelectPicker, IconButton } from "rsuite";
import PlusIcon from "@rsuite/icons/Plus";

import types from "../../store/modules/colaboradores/types";
import consts from "../../consts/consts";

export default function ColaboradorModal({ open, onClose, salvar }) {
  const dispatch = useDispatch();

  const { form, servicos, loadingServicos } = useSelector(
    (state) => state.colaborador,
  );

  /* ==========================================
     BUSCAR SERVIÇOS DO SALÃO
  ========================================== */
  useEffect(() => {
    if (open) {
      dispatch({
        type: types.LIST_SERVICOS_REQUEST,
        payload: consts.salaoId,
      });
    }
  }, [open, dispatch]);

  /* ==========================================
     UPDATE FORM
  ========================================== */
  const updateField = (field, value) => {
    dispatch({
      type: types.UPDATE_FORM,
      payload: { [field]: value },
    });
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return "";

    // remove tudo que não for número
    let numeros = telefone.replace(/\D/g, "");

    // 👉 limite de dígitos
    numeros = numeros.slice(0, 11);

    // celular — 11 dígitos
    if (numeros.length > 10) {
      return numeros.replace(
        /^(\d{2})(\d{5})(\d{0,4})$/,
        (_, ddd, parte1, parte2) =>
          `(${ddd}) ${parte1}${parte2 ? "-" + parte2 : ""}`,
      );
    }

    // fixo — até 10 dígitos
    if (numeros.length > 2) {
      return numeros.replace(
        /^(\d{2})(\d{0,4})(\d{0,4})$/,
        (_, ddd, parte1, parte2) =>
          `(${ddd}) ${parte1}${parte2 ? "-" + parte2 : ""}`,
      );
    }

    // só DDD
    if (numeros.length > 0) {
      return `(${numeros}`;
    }

    return "";
  };

  /* ==========================================
     PROTEÇÃO DO ARRAY SERVIÇOS
  ========================================== */
  const listaServicos = Array.isArray(servicos) ? servicos : [];

  const servicosOptions = listaServicos.map((s) => ({
    label: s.titulo,
    value: s._id,
  }));

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header className="modalHeaderColaborador" closeButton={false}>
        <Modal.Title>
          {form?._id ? "Editar Colaborador" : "Novo Colaborador"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form fluid>
          {/* NOME */}
          <Form.Group>
            <Form.ControlLabel>Nome</Form.ControlLabel>
            <Form.Control
              value={form.nome || ""}
              onChange={(value) => updateField("nome", value)}
            />
          </Form.Group>

          {/* EMAIL */}
          <Form.Group>
            <Form.ControlLabel>Email</Form.ControlLabel>
            <Form.Control
              type="email"
              value={form.email || ""}
              onChange={(value) => updateField("email", value)}
            />
          </Form.Group>

          {/* SENHA */}
          <Form.Group>
            <Form.ControlLabel>Senha</Form.ControlLabel>
            <Form.Control
              type="password"
              value={form.senha || ""}
              onChange={(value) => updateField("senha", value)}
            />
          </Form.Group>

          {/* TELEFONE */}
          <Form.Group>
            <Form.ControlLabel>Telefone</Form.ControlLabel>
            <Form.Control
              value={form.telefone || ""}
              onChange={(value) =>
                updateField("telefone", formatarTelefone(value))
              }
            />
          </Form.Group>

          {/* DATA NASCIMENTO */}
          <Form.Group>
            <Form.ControlLabel>Data de Nascimento</Form.ControlLabel>
            <Form.Control
              type="date"
              value={form.dataNascimento || ""}
              onChange={(value) => updateField("dataNascimento", value)}
            />
          </Form.Group>

          {/* SEXO */}
          <Form.Group>
            <Form.ControlLabel>Sexo</Form.ControlLabel>
            <SelectPicker
              data={[
                { label: "Masculino", value: "M" },
                { label: "Feminino", value: "F" },
              ]}
              value={form.sexo || null}
              onChange={(value) => updateField("sexo", value)}
              block
            />
          </Form.Group>

          {/* ESPECIALIDADES */}
          <Form.Group>
            <Form.ControlLabel>Especialidades</Form.ControlLabel>

            <div className="d-flex align-items-center gap-2">
              <SelectPicker
                data={servicosOptions}
                value={form.especialidades || []}
                onChange={(value) => updateField("especialidades", value)}
                placeholder="Selecione especialidades"
                loading={loadingServicos}
                block
                multiple
              />

              <IconButton
                size="sm"
                appearance="ghost"
                icon={<PlusIcon />}
                onClick={() => console.log("Abrir modal criar serviço")}
              />
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          className="btn"
          loading={form.loading}
          onClick={() =>
            salvar({
              ...form,
              salaoId: consts.salaoId,
            })
          }
        >
          Salvar
        </Button>

        <Button appearance="subtle" onClick={onClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
