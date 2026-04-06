import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Table } from "rsuite";
import {
  createServico,
  deleteServico,
  listServicos,
  updateServico,
} from "../../store/modules/servico/actions";

import ServicoModal from "../../components/servicoModal";
import ServicosViewModal from "../../components/servicoViewModal"; // Certifique-se de criar este componente
import consts from "../../consts/consts";
import { formatarDuracao,minutosParaDate } from "../../util/functionAux";

const { Column, HeaderCell, Cell } = Table;

export default function ServicosPage() {
  const dispatch = useDispatch();

  const servicos = useSelector((state) => state.servico.lista);
  const loading = useSelector((state) => state.servico.loading);

  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({});

  const [modalViewOpen, setModalViewOpen] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);

  useEffect(() => {
    dispatch(listServicos(consts.salaoId));
  }, [dispatch]);

  const salvar = () => {
    let formTratado = { ...form };

    if (formTratado.duracao instanceof Date) {
      formTratado.duracao =
        formTratado.duracao.getHours() * 60 + formTratado.duracao.getMinutes();
    }

    if (formTratado._id) {
      dispatch(
        updateServico({
          servico: formTratado,
          salaoId: consts.salaoId,
        }),
      );
    } else {
      dispatch(
        createServico({
          ...formTratado,
          salaoId: consts.salaoId,
        }),
      );
    }

    setOpenForm(false);
    setForm({});
  };


const editar = (row) => {
  setForm({
    ...row,
    duracao:
      typeof row.duracao === "number"
        ? minutosParaDate(row.duracao)
        : null,
  });

  setOpenForm(true);
};

  const remover = ({ _id }) => {
    dispatch(deleteServico({ id: _id, salaoId: consts.salaoId }));
  };

  return (
    <div className="container p-4">
      <div className="container-cliente">
        {/* Header */}
        <div className="w-100 d-flex justify-content-between align-items-center mb-4">
          <h1>Serviços</h1>
          <Button
            className="btn"
            size="lg"
            onClick={() => {
              setForm({});
              setOpenForm(true);
            }}
          >
            + Novo serviço
          </Button>
        </div>

        {/* Tabela */}
        <div className="card-table">
          {loading ? (
            <div className="d-none text-center py-4">Carregando serviços...</div>
          ) : servicos?.length === 0 ? (
            <div className="text-center py-4">Nenhum serviço encontrado.</div>
          ) : (
            <Table
              width={"100%"}
              data={servicos || []}
              bordered
              cellBordered
              autoHeight
              hover
            >
              {/* Título */}
              <Column flexGrow={2}>
                <HeaderCell>Serviço</HeaderCell>
                <Cell dataKey="titulo" />
              </Column>

              {/* Descrição */}
              <Column flexGrow={3}>
                <HeaderCell>Descrição</HeaderCell>
                <Cell dataKey="descricao" />
              </Column>

              {/* Preço */}
              <Column flexGrow={3}>
                <HeaderCell>Preço</HeaderCell>
                <Cell>
                  {(row) =>
                    row.preco != null ? `R$ ${row.preco.toFixed(2)}` : "-"
                  }
                </Cell>
              </Column>

              {/* Duração */}
              <Column flexGrow={2}>
                <HeaderCell>Duração</HeaderCell>
                <Cell>
                    {(row) => formatarDuracao(row.duracao)}
                </Cell>
              </Column>

              {/* Imagem */}
              <Column flexGrow={2}>
                <HeaderCell>Imagem</HeaderCell>
                <Cell>
                  {(row) => {
                    const img = row.arquivos?.[0];
                    return img ? (
                      <a
                        href={`${img.caminhoArquivo}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={`${img.caminhoArquivo}`}
                          alt={img.nome}
                          style={{ width: 80, borderRadius: 4 }}
                        />
                      </a>
                    ) : null;
                  }}
                </Cell>
              </Column>

              {/* Ações */}
              <Column flexGrow={2}>
                <HeaderCell>Ações</HeaderCell>
                <Cell>
                  {(row) => (
                    <div className="actions d-flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setServicoSelecionado(row);
                          setModalViewOpen(true);
                        }}
                      >
                        <span className="mdi mdi-eye" title="Visualizar" />
                      </Button>

                      <Button size="sm" onClick={() => editar(row)}>
                        <span className="mdi mdi-pencil" title="Editar" />
                      </Button>

                      <Button
                        appearance="subtle"
                        size="sm"
                        color="red"
                        onClick={() => remover(row)}
                      >
                        <span
                          className="mdi mdi-trash-can-outline"
                          title="Remover"
                        />
                      </Button>
                    </div>
                  )}
                </Cell>
              </Column>
            </Table>
          )}
        </div>
      </div>

      {/* Modal de formulário */}
      <ServicoModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        form={form}
        setForm={setForm}
        salvar={salvar}
      />

      {/* Modal de visualização */}
      {servicoSelecionado && (
        <ServicosViewModal
          open={modalViewOpen}
          onClose={() => setModalViewOpen(false)}
          servico={servicoSelecionado}
        />
      )}
    </div>
  );
}
