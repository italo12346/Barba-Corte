import { Modal } from "rsuite";
import { formatarDuracao } from "../../util/functionAux";
const ServicoViewModal = ({ open, onClose, servico, loading = false }) => {
  if (!servico) return null;

  const img = servico.arquivos?.[0];

  const getStatusBadge = (status) => {
    switch (status) {
      case "A":
        return "bg-success";
      case "I":
        return "bg-secondary";
      default:
        return "bg-dark";
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <Modal.Header>
        <Modal.Title>
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center overflow-hidden"
              style={{ width: 50, height: 50, fontSize: 20 }}
            >
              {img ? (
                <img
                  src={`${img.caminhoArquivo}`}
                  alt={img.nome}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                servico.titulo?.charAt(0)
              )}
            </div>
            <div>
              <h5 className="mb-0">{servico.titulo}</h5>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-dark" />
          </div>
        ) : (
          <div className="container-fluid">
            {/* Dados do serviço */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-dark text-white">
                Dados do Serviço
              </div>
              <div className="card-body row g-3">
                <Info label="Descrição" value={servico.descricao} />
                <Info label="Preço" value={`R$ ${servico.preco?.toFixed(2) || "-"}`} />
                <Info label="Comissão" value={` ${servico.comissao}%`} />
                <Info label="Duração" value={formatarDuracao(servico.duracao)}  />
                <Info
                  label="Status"
                  value={
                    <span className={`badge ${getStatusBadge(servico.status)}`}>
                      {servico.status === "A" ? "Ativo" : "Inativo"}
                    </span>
                  }
                />
              </div>
            </div>

            {/* Imagens */}
            {servico.arquivos?.length > 0 && (
              <div className="card shadow-sm">
                <div className="card-header bg-dark text-white">Imagens</div>
                <div className="card-body d-flex flex-wrap gap-2">
                  {servico.arquivos.map((arquivo) => (
                    <img
                      key={arquivo._id}
                      src={`${arquivo.caminhoArquivo}`}
                      alt={arquivo.nome}
                      style={{ width: 100, borderRadius: 4 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-ha" onClick={onClose}>
          Fechar
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ServicoViewModal;

const Info = ({ label, value }) => (
  <div className="col-md-4">
    <small className="text-muted">{label}</small>
    <div className="fw-semibold">{value || "-"}</div>
  </div>
);
