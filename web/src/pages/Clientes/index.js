import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button } from "rsuite";
import "rsuite/dist/rsuite.min.css";

import * as actions from "../../store/modules/cliente/actions";
import ClienteModal from "../../components/modal/index";

const { Column, HeaderCell, Cell } = Table;

const Clientes = () => {
  const dispatch = useDispatch();

  // Redux state
  const { data = [], loading = false } =
    useSelector(state => state.cliente);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] =
    useState(null);

  // Fetch clientes
  useEffect(() => {
    dispatch(actions.getClientes());
  }, [dispatch]);

  return (
    <div className="container p-4">

      <div className="container-cliente">

        {/* Header */}
        <div className="w-100 d-flex justify-content-between align-items-center mb-4">
          <h2>Clientes</h2>

          <button className="btn btn-lg">
            Novo Cliente
          </button>
        </div>

        {/* Card container */}
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">

            <Table
              height={800}
              width={Math.max(window.innerWidth - 400, 800)}
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
                <Cell dataKey="telefone" />
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>Cadastro</HeaderCell>
                <Cell dataKey="dataCadastro" />
              </Column>

              {/* Actions */}
              <Column flexGrow={1}>
                <HeaderCell>Ações</HeaderCell>

                <Cell>
                  {row => (
                    <div className="d-flex gap-2">

                      {/* VER */}
                      <Button
                        appearance="subtle"
                        size="sm"
                        onClick={() => {
                          setClienteSelecionado(row);
                          setModalOpen(true);
                        }}
                      >
                        <span className="mdi mdi-eye" />
                      </Button>

                      {/* EDITAR */}
                      <Button
                        appearance="subtle"
                        size="sm"
                      >
                        <span className="mdi mdi-pencil" />
                      </Button>

                      {/* DELETE */}
                      <Button
                        appearance="subtle"
                        size="sm"
                        color="red"
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

      {/* Modal reutilizável */}
      <ClienteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cliente={clienteSelecionado}
      />

    </div>
  );
};

export default Clientes;
