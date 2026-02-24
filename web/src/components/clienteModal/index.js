import {
  Modal,
  Button,
  Form,
  DatePicker,
  SelectPicker,
} from "rsuite";
import { useEffect } from "react";
import { formatarTelefone } from "../../util/functionAux";

export default function ClienteModal({
  open,
  onClose,
  form,
  setForm,
  salvar,
}) {
  const initialState = {
    nome: "",
    email: "",
    telefone: "",
    dataNascimento: null,
    sexo: "",
    senha: "",
    fotoFile: null,
    fotoPreview: null,
    documento: {
      numero: "",
      tipo: "CPF",
    },
  };

  useEffect(() => {
    if (!open) return;

    if (!form?._id) {
      setForm(initialState);
    }
  }, [open]);

  const handleChange = (value, name) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* =========================
     MÁSCARA CPF / CNPJ
  ========================= */
  const formatDocumento = (value, tipo) => {
    value = value.replace(/\D/g, "");

    if (tipo === "CPF") {
      return value
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    if (tipo === "CNPJ") {
      return value
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return value;
  };

  /* =========================
     UPLOAD FOTO
  ========================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      fotoFile: file,
      fotoPreview: preview,
    }));
  };

  const handleClose = () => {
    setForm(initialState);
    onClose();
  };

  return (
    <Modal size="sm" open={open} onClose={handleClose}>
      <Modal.Header>
        <Modal.Title>
          {form?._id ? "Editar Cliente" : "Novo Cliente"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form fluid layout="vertical">
          {/* FOTO */}
          <Form.Group style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "#f3f3f3",
                margin: "0 auto 10px",
                overflow: "hidden",
                border: "2px solid #e5e5e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={() =>
                document.getElementById("fileInput").click()
              }
            >
              {form?.fotoPreview ? (
                <img
                  src={form.fotoPreview}
                  alt="preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span style={{ fontSize: 12, color: "#999" }}>
                  Upload
                </span>
              )}
            </div>

            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </Form.Group>

          <div style={{ display: "grid", gap: 12 }}>
            {/* NOME */}
            <Form.Group>
              <Form.ControlLabel>Nome</Form.ControlLabel>
              <Form.Control
                value={form?.nome || ""}
                onChange={(v) => handleChange(v, "nome")}
              />
            </Form.Group>

            {/* EMAIL */}
            <Form.Group>
              <Form.ControlLabel>Email</Form.ControlLabel>
              <Form.Control
                type="email"
                value={form?.email || ""}
                onChange={(v) => handleChange(v, "email")}
              />
            </Form.Group>

            {/* TELEFONE */}
            <Form.Group>
              <Form.ControlLabel>Telefone</Form.ControlLabel>
              <Form.Control
                value={formatarTelefone(form?.telefone || "")}
                onChange={(v) => {
                  const onlyNumbers = v.replace(/\D/g, "");
                  if (onlyNumbers.length <= 11) {
                    handleChange(onlyNumbers, "telefone");
                  }
                }}
              />
            </Form.Group>

            {/* DATA + SEXO */}
            <div style={{ display: "flex", gap: 10 }}>
              <Form.Group style={{ flex: 1 }}>
                <Form.ControlLabel>Nascimento</Form.ControlLabel>
                <DatePicker
                  style={{ width: "100%" }}
                  format="dd/MM/yyyy"
                  oneTap
                  value={
                    form?.dataNascimento
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

              <Form.Group style={{ flex: 1 }}>
                <Form.ControlLabel>Sexo</Form.ControlLabel>
                <SelectPicker
                  style={{ width: "100%" }}
                  data={[
                    { label: "Masculino", value: "M" },
                    { label: "Feminino", value: "F" },
                    { label: "Outro", value: "O" },
                  ]}
                  value={form?.sexo || null}
                  onChange={(v) => handleChange(v, "sexo")}
                />
              </Form.Group>
            </div>

            {/* SENHA */}
            <Form.Group>
              <Form.ControlLabel>Senha</Form.ControlLabel>
              <Form.Control
                type="password"
                value={form?.senha || ""}
                onChange={(v) => handleChange(v, "senha")}
              />
            </Form.Group>

            {/* DOCUMENTO */}
            <div style={{ display: "flex", gap: 10 }}>
              {/* TIPO */}
              <Form.Group style={{ flex: 1 }}>
                <Form.ControlLabel>Tipo</Form.ControlLabel>
                <SelectPicker
                  style={{ width: "100%" }}
                  data={[
                    { label: "CPF", value: "CPF" },
                    { label: "CNPJ", value: "CNPJ" },
                  ]}
                  value={form?.documento?.tipo || "CPF"}
                  onChange={(tipo) =>
                    setForm((prev) => ({
                      ...prev,
                      documento: {
                        tipo,
                        numero: "",
                      },
                    }))
                  }
                  cleanable={false}
                />
              </Form.Group>

              {/* NÚMERO */}
              <Form.Group style={{ flex: 2 }}>
                <Form.ControlLabel>Número</Form.ControlLabel>
                <Form.Control
                  value={formatDocumento(
                    form?.documento?.numero || "",
                    form?.documento?.tipo || "CPF"
                  )}
                  onChange={(v) => {
                    const onlyNumbers = v.replace(/\D/g, "");

                    const maxLength =
                      form?.documento?.tipo === "CPF"
                        ? 11
                        : 14;

                    if (onlyNumbers.length <= maxLength) {
                      setForm((prev) => ({
                        ...prev,
                        documento: {
                          ...prev.documento,
                          numero: onlyNumbers,
                        },
                      }));
                    }
                  }}
                  placeholder={
                    form?.documento?.tipo === "CPF"
                      ? "000.000.000-00"
                      : "00.000.000/0000-00"
                  }
                />
              </Form.Group>
            </div>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button appearance="subtle" onClick={handleClose}>
          Cancelar
        </Button>

        <Button appearance="primary" onClick={salvar}>
          Salvar Cliente
        </Button>
      </Modal.Footer>
    </Modal>
  );
}