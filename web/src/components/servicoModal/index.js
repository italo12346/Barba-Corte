import {
  Modal,
  Button,
  Form,
  InputNumber,
  TimePicker,
  Input,
  SelectPicker,
  Uploader,
} from "rsuite";
import { useState } from "react";

const statusOptions = [
  { label: "Ativo", value: "A" },
  { label: "Inativo", value: "I" },
];

const recorrenciaOptions = [
  { label: "Único", value: "UNICO" },
  { label: "Semanal", value: "SEMANAL" },
  { label: "Mensal", value: "MENSAL" },
];

export default function ServicoModal({ open, onClose, form, setForm, salvar }) {
  const [files, setFiles] = useState([]);

  const handleChange = (value, name) => {
    setForm({ ...form, [name]: value });
  };

const handleFileChange = (fileList) => {
  setFiles(fileList);

  if (fileList.length > 0) {
    setForm({
      ...form,
      novaImagem: fileList[0].blobFile,
    });
  }
};

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <Modal.Header className="modalHeader">
        <Modal.Title>
          {form._id ? "Editar serviço" : "Novo serviço"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form fluid>
          {/* Título */}
          <Form.Group>
            <Form.Label>Nome do serviço</Form.Label>
            <Form.Control
              name="titulo"
              value={form.titulo || ""}
              onChange={(v) => handleChange(v, "titulo")}
            />
          </Form.Group>

          {/* Descrição */}
          <Form.Group>
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              name="descricao"
              accepter={Input}
              value={form.descricao || ""}
              onChange={(v) => handleChange(v, "descricao")}
              componentClass="textarea"
              rows={3}
            />
          </Form.Group>

          {/* Preço */}
          <Form.Group>
            <Form.Label>Preço</Form.Label>
            <Form.Control
              name="preco"
              accepter={InputNumber}
              value={form.preco ?? 0}
              onChange={(v) => handleChange(v ?? "", "preco")}
              min={0}
              step={1}
              style={{ width: "100%" }}
              formatter={(value) =>
                `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) => value.replace(/[R$\s.]/g, "")}
            />
          </Form.Group>

          {/* Comissão */}
          <Form.Group>
            <Form.Label>Comissão (%)</Form.Label>
            <Form.Control
              name="comissao"
              accepter={InputNumber}
              value={form.comissao ?? 0}
              onChange={(v) => handleChange(v ?? 0, "comissao")}
              min={0}
              max={100}
              step={1}
              style={{ width: "100%" }}
              formatter={(value) => `${value}%`}
              parser={(value) => value.replace("%", "")}
            />
          </Form.Group>

          {/* Duração */}
          <Form.Group>
            <Form.Label>Duração</Form.Label>
            <Form.Control
              name="duracao"
              accepter={TimePicker}
              value={form.duracao || null}
              onChange={(value) => handleChange(value, "duracao")}
              format="HH:mm"
              cleanable={false}
              style={{ width: "100%" }}
            />
          </Form.Group>
          <div className="d-flex text-center w-100 overflow-hidden">
            {/* Status */}
            <Form.Group>
              <Form.Label className="d-flex w-100 justify-content-center">
                Status
              </Form.Label>
              <Form.Control
                name="status"
                accepter={SelectPicker}
                value={form.status || "A"}
                onChange={(v) => handleChange(v, "status")}
                data={statusOptions}
              />
            </Form.Group>

            {/* Recorrência */}
            <Form.Group>
              <Form.Label className="d-flex w-100 justify-content-center">
                Recorrência
              </Form.Label>
              <Form.Control
                name="recorrencia"
                accepter={SelectPicker}
                value={form.recorrencia || "UNICO"}
                onChange={(v) => handleChange(v, "recorrencia")}
                data={recorrenciaOptions}
                style={{ width: "100%" }}
              />
            </Form.Group>

            {/* Upload de imagens */}
            <Form.Group>
              <Form.Label className="d-flex w-100 justify-content-center">
                Imagens
              </Form.Label>
              <Uploader
                autoUpload={false}
                multiple
                fileList={files}
                onChange={handleFileChange}
                draggable
                listType="picture-text"
                action="" // Sem envio automático
              />
            </Form.Group>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button className="btn" onClick={salvar}>
          Salvar
        </Button>
        <Button appearance="subtle" onClick={onClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
