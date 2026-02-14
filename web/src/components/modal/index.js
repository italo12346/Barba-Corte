import { Modal, Button } from "rsuite";

const ClienteModal = ({ open, onClose, cliente }) => {
  return (
    <Modal open={open} onClose={onClose} size="md">
      <Modal.Header>
        <Modal.Title>Dados do Cliente</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {cliente && (
          <div className="d-flex flex-column gap-2">

            <div><strong>Nome:</strong> {cliente.nome}</div>
            <div><strong>Email:</strong> {cliente.email}</div>
            <div><strong>Telefone:</strong> {cliente.telefone}</div>
            <div><strong>Cadastro:</strong> {cliente.dataCadastro}</div>

          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={onClose}>Fechar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClienteModal;
