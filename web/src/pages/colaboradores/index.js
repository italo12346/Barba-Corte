import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Table, Badge } from "rsuite";

import {
  allColaboradores,
  createColaborador,
  updateColaborador,
  unlikeColaborador,
} from "../../store/modules/colaboradores/actions";

import ColaboradorModal from "../../components/colaboradorModal";
import ColaboradorViewModal from "../../components/colaboradorViewModal";
import consts from "../../consts/consts";

const { Column, HeaderCell, Cell } = Table;

export default function Colaboradores() {
  const dispatch = useDispatch();

  const { lista = [], loading = false } = useSelector(
    (state) => state.colaborador || {},
  );

  // Modal criar / editar
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({});

  // Modal visualizar 👁️
  const [modalViewOpen, setModalViewOpen] = useState(false);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);

  // ===============================
  // LOAD
  // ===============================
  useEffect(() => {
    dispatch(allColaboradores(consts.salaoId));
  }, [dispatch]);

  // ===============================
  // CRUD
  // ===============================
  const novo = () => {
    setForm({});
    setOpenForm(true);
  };

  const editar = (row) => {
    setForm({
      ...row,
      vinculoId: row.vinculoId || row._id, // vinculoId do SalaoColaborador, ou _id se for mesmo
      vinculo: row.status, // para atualizar status no vínculo
    });
    setOpenForm(true);
  };

  const salvar = () => {
    console.log("FORM NO SALVAR:", form);

    if (form._id) {
      console.log("DISPARANDO UPDATE com _id:", form._id);
      dispatch(
        updateColaborador({
          salaoId: consts.salaoId,
          colaborador: { ...form }, // form deve ter _id
        }),
      );
    } else {
      console.log("DISPARANDO CREATE");
      dispatch(
        createColaborador({
          salaoId: consts.salaoId,
          colaborador: { ...form },
        }),
      );
    }

    setOpenForm(false);
  };

  const desvincular = (id) => {
    if (!window.confirm("Desvincular colaborador?")) return;

    dispatch(
      unlikeColaborador({
        id,
        salaoId: consts.salaoId,
      }),
    );
  };

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

  // ===============================
  // HELPERS
  // ===============================
  const statusBadge = (status) =>
    status === "A" ? (
      <Badge color="green">Ativo</Badge>
    ) : (
      <Badge color="red">Inativo</Badge>
    );

  // ===============================
  // UI
  // ===============================
  return (
    <div className="container p-4">
      <div className="container-cliente">
        <div className="w-100 d-flex justify-content-between align-items-center mb-4">
          <h1>Colaboradores</h1>
          <Button className="btn" size="lg" onClick={novo}>
            + Novo colaborador
          </Button>
        </div>

        {/* Tabela */}
        <div className="card-table ">
          <div className="card-body p-0">
            <Table
              width={"100%"}
              data={lista}
              loading={loading}
              rowKey="id"
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
                <HeaderCell>Status</HeaderCell>
                <Cell>{(row) => statusBadge(row.status)}</Cell>
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
                          setColaboradorSelecionado(row);
                          setModalViewOpen(true);
                        }}
                      >
                        <span className="mdi mdi-eye" />
                      </Button>

                      {/* ✏️ EDITAR */}
                      <Button
                        appearance="subtle"
                        size="sm"
                        onClick={() => editar(row)}
                      >
                        <span className="mdi mdi-pencil" />
                      </Button>

                      {/* 🗑️ Desvincular */}
                      <Button
                        appearance="subtle"
                        size="sm"
                        color="red"
                        onClick={() => desvincular(row.vinculoId)}
                      >
                        <span className="mdi mdi-link-off fs-5 " />
                      </Button>
                    </div>
                  )}
                </Cell>
              </Column>
            </Table>
          </div>
        </div>

        {/* MODAL CRIAR / EDITAR */}
        <ColaboradorModal
          open={openForm}
          onClose={() => setOpenForm(false)}
          form={form}
          setForm={setForm}
          salvar={salvar}
          salaoId={consts.salaoId}
        />

        {/* MODAL VISUALIZAR 👁️ */}
        <ColaboradorViewModal
          open={modalViewOpen}
          onClose={() => setModalViewOpen(false)}
          colaborador={colaboradorSelecionado}
        />
      </div>
    </div>
  );
}
