import {
  Modal,
  Button,
  Form,
  DatePicker,
  SelectPicker,
  CheckPicker,
} from "rsuite";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { allServicos } from "../../store/modules/colaboradores/actions";

export default function ColaboradorModal({
  open,
  onClose,
  form,
  setForm,
  salvar,
  salaoId,
}) {
  const dispatch = useDispatch();

  // serviços vindos do Redux
  const servicos = useSelector(
    (state) => state.colaborador.servicos
  );

  // transforma para formato do picker
  const especialidadesData = servicos.map((s) => ({
    label: s.titulo,
    value: s.id,
  }));

  // ===============================
  // Inicializa form + carrega serviços
  // ===============================
  useEffect(() => {
    if (!open) return;

    setForm((prev) => ({
      _id: prev?._id,
      nome: prev?.nome || "",
      email: prev?.email || "",
      telefone: prev?.telefone || "",
      status: prev?.status || "A",
      dataNascimento: prev?.dataNascimento || null,
      sexo: prev?.sexo || "",
      especialidades: prev?.especialidades || [],
    }));

    if (salaoId) {
      dispatch(allServicos(salaoId));
    }
  }, [open, salaoId]);

  // ===============================
  // Change handler
  // ===============================
  const handleChange = (value, name) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  // ===============================
  // Close
  // ===============================
  const handleClose = () => {
    setForm({});
    onClose();
  };

  return (
    <Modal size="md" open={open} onClose={handleClose}>
      <Modal.Header>
        <Modal.Title>
          {form._id ? "Editar colaborador" : "Novo colaborador"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form fluid layout="vertical">
          <Form.Group>
            <Form.ControlLabel>Nome</Form.ControlLabel>
            <Form.Control
              value={form.nome || ""}
              onChange={(v) => handleChange(v, "nome")}
            />
          </Form.Group>

          <Form.Group>
            <Form.ControlLabel>Email</Form.ControlLabel>
            <Form.Control
              type="email"
              value={form.email || ""}
              onChange={(v) => handleChange(v, "email")}
            />
          </Form.Group>

          <Form.Group>
            <Form.ControlLabel>Telefone</Form.ControlLabel>
            <Form.Control
              value={form.telefone || ""}
              onChange={(v) => handleChange(v, "telefone")}
            />
          </Form.Group>

          <Form.Group>
            <Form.ControlLabel>Data de Nascimento</Form.ControlLabel>
            <DatePicker
              style={{ width: "100%" }}
              format="dd/MM/yyyy"
              oneTap
              value={
                form.dataNascimento
                  ? new Date(form.dataNascimento)
                  : null
              }
              onChange={(v) =>
                handleChange(v, "dataNascimento")
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.ControlLabel>Sexo</Form.ControlLabel>
            <SelectPicker
              style={{ width: "100%" }}
              data={[
                { label: "Masculino", value: "M" },
                { label: "Feminino", value: "F" },
                { label: "Outro", value: "O" },
              ]}
              value={form.sexo || null}
              onChange={(v) => handleChange(v, "sexo")}
              cleanable
            />
          </Form.Group>

          <Form.Group>
            <Form.ControlLabel>Especialidades</Form.ControlLabel>
            <CheckPicker
              style={{ width: "100%" }}
              data={especialidadesData}
              value={form.especialidades || []}
              onChange={(v) =>
                handleChange(v, "especialidades")
              }
              placeholder="Selecione os serviços"
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button appearance="primary" onClick={salvar}>
          Salvar
        </Button>

        <Button appearance="subtle" onClick={handleClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
