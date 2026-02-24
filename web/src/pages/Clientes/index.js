import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button } from "rsuite";
import "rsuite/dist/rsuite.min.css";

import * as actions from "../../store/modules/cliente/actions";
import ClienteViewModal from "../../components/clienteViewModal";
import ClienteModal from "../../components/clienteModal";
const { formatarTelefone, formatarData } = require("../../util/functionAux");
const { Column, HeaderCell, Cell } = Table;

const Clientes = () => {
  const dispatch = useDispatch();

  const {
    data = [],
    loading = false,
    agendamentos = [],
    loadingAgendamentos = false,
  } = useSelector((state) => state.cliente);

  // ===============================
  // MODAL VISUALIZAR
  // ===============================
  const [viewOpen, setViewOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  // ===============================
  // MODAL CREATE / EDIT
  // ===============================
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({});

  // ===============================
  // INIT
  // ===============================
  useEffect(() => {
    dispatch(actions.getClientes());
  }, [dispatch]);

  // ===============================
  // SALVAR CLIENTE
  // ===============================
  const salvar = () => {
    if (form._id) {
      dispatch(actions.updateCliente(form));
    } else {
      dispatch(actions.createCliente(form));
    }

    setFormOpen(false);
  };

  return (
    <div className="container p-4">
      <div className="container-cliente">
        {/* HEADER */}
        <div className="w-100 d-flex justify-content-between align-items-center mb-4">
          <h1>Clientes</h1>

          <Button
            className="btn"
            onClick={() => {
              setForm({});
              setFormOpen(true);
            }}
          >
            + Novo Cliente
          </Button>
        </div>

        {/* TABELA */}
        <div className="card-table">
          <div className="card-body p-0">
            <Table
              height={400}
              data={Array.isArray(data) ? data : []}
              loading={loading}
              rowKey="_id"
              bordered
              hover
              cellBordered
              autoHeight
            >
              <Column flexGrow={2}>
                <HeaderCell>Nome</HeaderCell>
                <Cell dataKey="nome" />
              </Column>

              <Column flexGrow={2}>
                <HeaderCell>Email</HeaderCell>
                <Cell dataKey="email" />
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>Telefone</HeaderCell>
                <Cell>{(rowData) => formatarTelefone(rowData?.telefone)}</Cell>
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>Cadastro</HeaderCell>
                <Cell>{(rowData) => formatarData(rowData?.dataCadastro)}</Cell>
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>Ações</HeaderCell>
                <Cell>
                  {(row) => (
                    <div className="actions d-flex gap-2">
                      {/* 👁️ VISUALIZAR */}
                      <Button
                        appearance="subtle"
                        size="sm"
                        onClick={() => {
                          setClienteSelecionado(row);
                          setViewOpen(true);
                          dispatch(actions.getAgendamentosCliente(row._id));
                        }}
                      >
                        <span className="mdi mdi-eye" />
                      </Button>

                      {/* ✏️ EDITAR */}
                      <Button
                        appearance="subtle"
                        size="sm"
                        onClick={() => {
                          setForm(row);
                          setFormOpen(true);
                        }}
                      >
                        <span className="mdi mdi-pencil" />
                      </Button>

                      {/* 🗑️ EXCLUIR */}
                      <Button
                        appearance="subtle"
                        size="sm"
                        color="red"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Deseja realmente excluir este cliente?",
                            )
                          ) {
                            dispatch(actions.deleteCliente(row._id));
                          }
                        }}
                      >
                        <span className="mdi mdi-delete" />
                      </Button>
                    </div>
                  )}
                </Cell>
              </Column>
            </Table>
          </div>
        </div>
      </div>

      {/* ===============================
          MODAL VISUALIZAR
      =============================== */}
      <ClienteViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        cliente={clienteSelecionado}
        agendamentos={agendamentos}
        loading={loadingAgendamentos}
      />

      {/* ===============================
          MODAL CREATE / EDIT
      =============================== */}
      <ClienteModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        form={form}
        setForm={setForm}
        salvar={salvar}
      />
    </div>
  );
};

export default Clientes;
