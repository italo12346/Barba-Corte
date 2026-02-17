import {
  Modal,
  Button,
  Form,
  DatePicker,
  SelectPicker,
  CheckPicker,
} from "rsuite";

import { useEffect } from "react";

export default function ColaboradorModal({
  open,
  onClose,
  form,
  setForm,
  salvar,
}) {
  // ===============================
  // Inicializa estrutura do form
  // ===============================
  useEffect(() => {
    if (!open) return;

    setForm((prev) => ({
      _id: prev?._id, // ✅ mantém o ID correto
      nome: prev?.nome || "",
      email: prev?.email || "",
      telefone: prev?.telefone || "",
      status: prev?.status || "A",
      dataNascimento: prev?.dataNascimento || null,
      sexo: prev?.sexo || "",
      especialidades: prev?.especialidades || [],
    }));
  }, [open]);

  // ===============================
  // Change handler genérico
  // ===============================
  const handleChange = (value, name) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  // ===============================
  // Mock especialidades
  // (depois você conecta com backend)
  // ===============================
  const especialidadesData = [
    { label: "Corte", value: "corte" },
    { label: "Barba", value: "barba" },
    { label: "Sobrancelha", value: "sobrancelha" },
  ];

  // ===============================
  // Close com reset
  // ===============================
  const handleClose = () => {
    setForm({});
    onClose();
  };

  return (
    <Modal size="md" open={open} onClose={handleClose}>
      <Modal.Header>
        <Modal.Title>
          {form.id ? "Editar colaborador" : "Novo colaborador"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form fluid layout="vertical">
          {/* Nome */}
          <Form.Group>
            <Form.ControlLabel>Nome</Form.ControlLabel>
            <Form.Control
              name="nome"
              value={form.nome || ""}
              onChange={(value) => handleChange(value, "nome")}
            />
          </Form.Group>

          {/* Email */}
          <Form.Group>
            <Form.ControlLabel>Email</Form.ControlLabel>
            <Form.Control
              name="email"
              type="email"
              value={form.email || ""}
              onChange={(value) => handleChange(value, "email")}
            />
          </Form.Group>

          {/* Telefone */}
          <Form.Group>
            <Form.ControlLabel>Telefone</Form.ControlLabel>
            <Form.Control
              name="telefone"
              value={form.telefone || ""}
              onChange={(value) => handleChange(value, "telefone")}
            />
          </Form.Group>

          {/* Data de Nascimento */}
          <Form.Group>
            <Form.ControlLabel>Data de Nascimento</Form.ControlLabel>
            <DatePicker
              style={{ width: "100%" }}
              format="dd/MM/yyyy"
              oneTap
              value={
                form.dataNascimento && !isNaN(new Date(form.dataNascimento))
                  ? new Date(form.dataNascimento)
                  : null
              }
              onChange={(value) => handleChange(value, "dataNascimento")}
            />
          </Form.Group>

          {/* Sexo */}
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
              onChange={(value) => handleChange(value, "sexo")}
              placeholder="Selecione"
              cleanable
            />
          </Form.Group>

          {/* Especialidades */}
          <Form.Group>
            <Form.ControlLabel>Especialidades</Form.ControlLabel>
            <CheckPicker
              style={{ width: "100%" }}
              data={especialidadesData}
              value={form.especialidades || []}
              onChange={(value) => handleChange(value, "especialidades")}
              placeholder="Selecione as especialidades"
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
