import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button } from "rsuite";
import "rsuite/dist/rsuite.min.css";

import * as actions from "../../store/modules/cliente/actions";
import ClienteModal from "../../components/clienteModal";

const { Column, HeaderCell, Cell } = Table;

const Clientes = () => {
  const dispatch = useDispatch();

  // Redux state
  const {
    data = [],
    loading = false,
    agendamentos = [],
    loadingAgendamentos = false,
  } = useSelector((state) => state.cliente);

  // Modal (Visualizar Cliente)
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const formatarTelefone = (telefone) => {
    if (!telefone) return "-";
    const numeros = telefone.replace(/\D/g, "");

    if (numeros.length === 11) {
      return numeros.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }

    if (numeros.length === 10) {
      return numeros.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }

    return telefone;
  };

  // Buscar clientes ao montar
  useEffect(() => {
    dispatch(actions.getClientes());
  }, [dispatch]);

  return (
    <div className="container p-4">
      <div className="container-cliente">
        {/* Header */}
        <div className="w-100 d-flex justify-content-between align-items-center mb-4">
          <h1>Clientes</h1>
        </div>

        {/* Tabela */}
        <div className="card ">
          <div className="card-body p-0">
            <Table
              height={565}
              width={'100%'}
              data={Array.isArray(data) ? data : []}
              loading={loading}
              rowKey="_id"
              bordered
              hover
              cellBordered
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
                <Cell>{(rowData) => formatarTelefone(rowData.telefone)}</Cell>
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>Cadastro</HeaderCell>
                <Cell dataKey="dataCadastro" />
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>Ações</HeaderCell>
                <Cell>
                  {(row) => (
                    <div className="actions d-flex gap-2">
                      <Button
                        appearance="subtle"
                        size="sm"
                        onClick={() => {
                          setClienteSelecionado(row);
                          setModalOpen(true);
                          dispatch(actions.getAgendamentosCliente(row._id));
                        }}
                      >
                        <span className="mdi mdi-eye" />
                      </Button>
                    </div>
                  )}
                </Cell>
              </Column>
            </Table>
          </div>
        </div>
      </div>

      {/* Modal Visualizar */}
      <ClienteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cliente={clienteSelecionado}
        agendamentos={agendamentos}
        loading={loadingAgendamentos}
      />
    </div>
  );
};

export default Clientes;
