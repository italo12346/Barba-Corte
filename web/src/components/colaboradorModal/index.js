import {
  Modal,
  Button,
  Form,
  DatePicker,
  SelectPicker,
  CheckPicker,
  Uploader,
} from "rsuite";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { allServicos } from "../../store/modules/colaboradores/actions";
import { formatarTelefone } from "../../util/functionAux";

export default function ColaboradorModal({
  open,
  onClose,
  form,
  setForm,
  salvar,
  salaoId,
}) {
  const dispatch = useDispatch();
  const servicos = useSelector((state) => state.colaborador.servicos);

  // ===============================
  // Serviços formatados para picker
  // ===============================
  const especialidadesData = useMemo(() => {
    return servicos.map((s) => ({
      label: s.titulo,
      value: s._id || s.id,
    }));
  }, [servicos]);

  // ===============================
  // Inicialização controlada
  // ===============================
  useEffect(() => {
    if (!open) return;

    if (!form?._id) {
      setForm({
        nome: "",
        email: "",
        telefone: "",
        status: "A",
        dataNascimento: null,
        sexo: "",
        especialidades: [],
        fotoFile: null,
      });
    }

    if (salaoId) {
      dispatch(allServicos(salaoId));
    }
  }, [open, salaoId, dispatch, setForm, form?._id]);

  // ===============================
  // Change handler seguro
  // ===============================
  const handleChange = (value, name) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===============================
  // Upload de foto
  // ===============================
  const handleFotoChange = (files) => {
    if (!files?.length) return;

    handleChange(files[0].blobFile, "fotoFile");
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
      <Modal.Header className="modalHeader">
        <Modal.Title>
          {form._id ? "Editar colaborador" : "Novo colaborador"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form fluid layout="vertical">

          {/* FOTO */}
          <Form.Group>
            <Form.Label>Foto</Form.Label>
            <Uploader
              autoUpload={false}
              fileListVisible
              accept="image/*"
              listType="picture"
              onChange={handleFotoChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Nome</Form.Label>
            <Form.Control
              value={form.nome || ""}
              onChange={(v) => handleChange(v, "nome")}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={form.email || ""}
              onChange={(v) => handleChange(v, "email")}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Telefone</Form.Label>
            <Form.Control
              value={formatarTelefone(form.telefone)}
              onChange={(v) => {
                const onlyNumbers = v.replace(/\D/g, "");
                if (onlyNumbers.length <= 11) {
                  handleChange(onlyNumbers, "telefone");
                }
              }}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Data de Nascimento</Form.Label>
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
                handleChange(
                  v ? v.toISOString() : null,
                  "dataNascimento"
                )
              }
            />
          </Form.Group>

          <div className="d-flex gap-3">

            <Form.Group style={{ flex: 1 }}>
              <Form.Label>Sexo</Form.Label>
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

            <Form.Group style={{ flex: 1 }}>
              <Form.Label>Especialidades</Form.Label>
              <CheckPicker
                style={{ width: "100%" }}
                data={especialidadesData}
                value={form.especialidades || []}
                onChange={(v) => handleChange(v, "especialidades")}
                placeholder="Selecione os serviços"
              />
            </Form.Group>

          </div>
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
