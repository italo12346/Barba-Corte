import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import types from "../../store/modules/perfil/types";
import "./profile.css";

import { formatarTelefone } from "../../util/functionAux";

// Importações do Leaflet (Certifique-se de instalar: npm install react-leaflet leaflet)
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

// Fix para ícone do Leaflet (necessário no React)
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const INITIAL_FORM = {
  nome: "",
  email: "",
  telefone: "",
  logradouro: "",
  cidade: "",
  uf: "",
  cep: "",
  numero: "",
  senhaAtual: "",
  novaSenha: "",
  confirmarSenha: "",
  geo: null, // 🔥 Novo campo para armazenar a lat/lng do marcador
};

export default function Profile() {
  const dispatch = useDispatch();
  const { salao, loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState(INITIAL_FORM);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [erros, setErros] = useState({});
  const [showSenha, setShowSenha] = useState(false);
  const fileRef = useRef();

  // Preenche o form com os dados do salão vindos do Redux
  useEffect(() => {
    if (salao) {
      setForm({
        nome: salao.nome || "",
        email: salao.email || "",
        telefone: salao.telefone || "",
        logradouro: salao.endereco?.logradouro || "",
        cidade: salao.endereco?.cidade || "",
        uf: salao.endereco?.uf || "",
        cep: salao.endereco?.cep || "",
        numero: salao.endereco?.numero || "",
        geo: salao.geo || null, // Carrega o geo atual do banco
      });
      setFotoPreview(salao.foto || null);
    }
  }, [salao]);

  const set = (field) => (e) => {
    let value = e.target.value;

    // Máscara de CEP (00000-000)
    if (field === "cep") {
      value = value.replace(/\D/g, "");
      if (value.length > 5) {
        value = value.substring(0, 5) + "-" + value.substring(5, 8);
      }

      const cleanCEP = value.replace("-", "");
      if (cleanCEP.length === 8) {
        buscarEndereco(cleanCEP);
      }
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buscarEndereco = async (cep) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          logradouro: data.logradouro,
          cidade: data.localidade,
          uf: data.uf,
        }));

        // 🔥 Busca automática de coordenadas ao mudar o CEP
        const query = `${data.logradouro}, ${data.localidade}, ${data.uf}, ${cep}, Brasil`;
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
        );
        const geoData = await geoResponse.json();
        if (geoData.length > 0) {
          setForm((prev) => ({
            ...prev,
            geo: {
              type: "Point",
              coordinates: [
                parseFloat(geoData[0].lon),
                parseFloat(geoData[0].lat),
              ],
            },
          }));
        }
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = "Nome é obrigatório";
    if (!form.email.trim()) e.email = "E-mail é obrigatório";
    if (showSenha) {
      if (!form.senhaAtual) e.senhaAtual = "Informe a senha atual";
      if (!form.novaSenha) e.novaSenha = "Informe a nova senha";
      if (form.novaSenha !== form.confirmarSenha)
        e.confirmarSenha = "As senhas não coincidem";
    }
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      fotoFile,
    };

    dispatch({ type: types.UPDATE_PERFIL_REQUEST, payload });

    setSuccessMsg("Perfil atualizado com sucesso!");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const initials = form.nome
    ? form.nome
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  // 🔥 Componente interno para lidar com o marcador arrastável
  function DraggableMarker() {
    const markerRef = useRef(null);
    const eventHandlers = {
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setForm((prev) => ({
            ...prev,
            geo: {
              type: "Point",
              coordinates: [lng, lat], // MongoDB usa [long, lat]
            },
          }));
        }
      },
    };

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={
          form.geo?.coordinates
            ? [form.geo.coordinates[1], form.geo.coordinates[0]]
            : [0, 0]
        }
        ref={markerRef}
      ></Marker>
    );
  }

  return (
    <div className="container p-4 overflow-auto">
      <div className="container-cliente">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="profile-page-icon">
            <span className="mdi mdi-account-cog" />
          </div>
          <div>
            <h1
              className="mb-0"
              style={{ color: "var(--dark)", fontWeight: 700 }}
            >
              Perfil do Salão
            </h1>
            <p className="mb-0" style={{ color: "#888", fontSize: "0.9rem" }}>
              Gerencie as informações e a identidade visual do seu negócio
            </p>
          </div>
        </div>

        {/* ── Alertas ─────────────────────────────────────────────── */}
        {successMsg && (
          <div className="profile-alert profile-alert--success mb-3">
            <span className="mdi mdi-check-circle me-2" />
            {successMsg}
          </div>
        )}
        {error && (
          <div className="profile-alert profile-alert--danger mb-3">
            <span className="mdi mdi-alert-circle me-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* ── Coluna Esquerda — Avatar ─────────────────────────── */}
            <div className="col-lg-4">
              <div className="card-table d-flex flex-column align-items-center gap-3 py-4">
                <div
                  className="profile-avatar"
                  onClick={() => fileRef.current.click()}
                  title="Clique para trocar a foto"
                >
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt="foto do salão"
                      className="profile-avatar__img"
                    />
                  ) : (
                    <span className="profile-avatar__initials">{initials}</span>
                  )}
                  <div className="profile-avatar__overlay">
                    <span className="mdi mdi-camera" />
                    <span>Trocar foto</span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  style={{ display: "none" }}
                  onChange={handleFotoChange}
                />
                <div className="text-center">
                  <p
                    className="mb-0 fw-bold"
                    style={{ color: "var(--dark)", fontSize: "1.1rem" }}
                  >
                    {form.nome || "Seu Salão"}
                  </p>
                  <p
                    className="mb-0"
                    style={{ color: "#888", fontSize: "0.85rem" }}
                  >
                    {form.email}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm w-100 mt-1"
                  onClick={() => fileRef.current.click()}
                >
                  <span className="mdi mdi-upload me-1" />
                  Fazer upload de foto
                </button>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#aaa",
                    textAlign: "center",
                  }}
                >
                  JPG, PNG ou WEBP · Máx. 5 MB
                </p>
              </div>
            </div>

            {/* ── Coluna Direita — Dados ───────────────────────────── */}
            <div className="col-lg-8 d-flex flex-column gap-4">
              <div className="card-table">
                <h6 className="profile-section-title">
                  <span className="mdi mdi-store me-2" />
                  Informações do Salão
                </h6>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="agendamento-label">Nome do Salão *</label>
                    <input
                      className={`profile-input ${erros.nome ? "profile-input--error" : ""}`}
                      value={form.nome}
                      onChange={set("nome")}
                      placeholder="Ex: Barbearia do João"
                    />
                    {erros.nome && (
                      <span className="profile-error">{erros.nome}</span>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="agendamento-label">E-mail *</label>
                    <input
                      type="email"
                      className={`profile-input ${erros.email ? "profile-input--error" : ""}`}
                      value={form.email}
                      onChange={set("email")}
                      placeholder="contato@seusalao.com"
                    />
                    {erros.email && (
                      <span className="profile-error">{erros.email}</span>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="agendamento-label">Telefone</label>
                    <input
                      className="profile-input"
                      value={formatarTelefone(form.telefone)}
                      onChange={set("telefone")}
                      placeholder="(99) 99999-9999"
                      maxLength={14}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="agendamento-label">CEP</label>
                    <input
                      className="profile-input"
                      value={form.cep}
                      onChange={set("cep")}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                  <div className="col-md-9">
                    <label className="agendamento-label">
                      Logradouro (Rua)
                    </label>
                    <input
                      className="profile-input"
                      value={form.logradouro}
                      onChange={set("logradouro")}
                      placeholder="Ex: Avenida Paulista"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="agendamento-label">Número</label>
                    <input
                      className="profile-input"
                      value={form.numero}
                      onChange={set("numero")}
                      placeholder="000"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="agendamento-label">Cidade</label>
                    <input
                      className="profile-input"
                      value={form.cidade}
                      onChange={set("cidade")}
                      placeholder="Ex: Fortaleza"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="agendamento-label">UF</label>
                    <input
                      className="profile-input"
                      value={form.uf}
                      onChange={set("uf")}
                      placeholder="Ex: CE"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              {/* Alterar Senha */}
              <div className="card-senha">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="profile-section-title mb-0">
                    <span className="mdi mdi-lock me-2" />
                    Alterar Senha
                  </h6>
                  <button
                    type="button"
                    className="profile-toggle-senha"
                    onClick={() => {
                      setShowSenha((v) => !v);
                      setForm((f) => ({
                        ...f,
                        senhaAtual: "",
                        novaSenha: "",
                        confirmarSenha: "",
                      }));
                      setErros((e) => ({
                        ...e,
                        senhaAtual: null,
                        novaSenha: null,
                        confirmarSenha: null,
                      }));
                    }}
                  >
                    {showSenha ? "Cancelar" : "Alterar senha"}
                  </button>
                </div>
                {!showSenha ? (
                  <p style={{ color: "#aaa", fontSize: "0.875rem", margin: 0 }}>
                    Sua senha está segura. Clique em "Alterar senha" para
                    redefinir.
                  </p>
                ) : (
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="agendamento-label">Senha Atual *</label>
                      <input
                        type="password"
                        className={`profile-input ${erros.senhaAtual ? "profile-input--error" : ""}`}
                        value={form.senhaAtual}
                        onChange={set("senhaAtual")}
                        placeholder="••••••••"
                      />
                      {erros.senhaAtual && (
                        <span className="profile-error">
                          {erros.senhaAtual}
                        </span>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="agendamento-label">Nova Senha *</label>
                      <input
                        type="password"
                        className={`profile-input ${erros.novaSenha ? "profile-input--error" : ""}`}
                        value={form.novaSenha}
                        onChange={set("novaSenha")}
                        placeholder="••••••••"
                      />
                      {erros.novaSenha && (
                        <span className="profile-error">{erros.novaSenha}</span>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="agendamento-label">
                        Confirmar Nova Senha *
                      </label>
                      <input
                        type="password"
                        className={`profile-input ${erros.confirmarSenha ? "profile-input--error" : ""}`}
                        value={form.confirmarSenha}
                        onChange={set("confirmarSenha")}
                        placeholder="••••••••"
                      />
                      {erros.confirmarSenha && (
                        <span className="profile-error">
                          {erros.confirmarSenha}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Botão salvar */}
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() => {
                    if (salao) {
                      setForm({
                        nome: salao.nome || "",
                        email: salao.email || "",
                        telefone: salao.telefone || "",
                        logradouro: salao.endereco?.logradouro || "",
                        cidade: salao.endereco?.cidade || "",
                        uf: salao.endereco?.uf || "",
                        cep: salao.endereco?.cep || "",
                        numero: salao.endereco?.numero || "",
                        senhaAtual: "",
                        novaSenha: "",
                        confirmarSenha: "",
                        geo: salao.geo || null,
                      });
                      setFotoPreview(salao.foto || null);
                      setFotoFile(null);
                      setErros({});
                      setShowSenha(false);
                    }
                  }}
                  disabled={loading}
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="btn agendamento-btn px-5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <span className="mdi mdi-content-save me-2" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* 🔥 NOVO MAPA INTERATIVO */}
        <div className="card p-4 mt-4">
          <h6 className="profile-section-title">
            <span className="mdi mdi-map-marker-radius me-2" />
            Localização do Salão (Arraste o marcador)
          </h6>
          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
            Caso o endereço não esteja exato, você pode arrastar o marcador azul
            para a posição correta.
          </p>

          {/* Mapa */}
          <div
            style={{
              height: "400px",
              width: "100%",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #ddd",
            }}
          >
            {form.geo?.coordinates ? (
              <MapContainer
                center={[form.geo.coordinates[1], form.geo.coordinates[0]]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <DraggableMarker />
              </MapContainer>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                <p className="text-muted">
                  Preencha o CEP para carregar o mapa.
                </p>
              </div>
            )}
          </div>

          {/* Botões FORA do div do mapa (overflow: hidden escondia antes) */}
          {form.geo?.coordinates && (
            <div className="d-flex gap-2 flex-wrap mt-3">
              <a
                href={`https://www.google.com/maps?q=${form.geo.coordinates[1]},${form.geo.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              >
                <span className="mdi mdi-map-marker" />
                Abrir no Google Maps
              </a>

              <a
                href={`https://maps.google.com/maps?daddr=${form.geo.coordinates[1]},${form.geo.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              >
                <span className="mdi mdi-navigation" />
                Ver rota / direções
              </a>

              <a
                href={`https://www.google.com/maps?layer=c&cbll=${form.geo.coordinates[1]},${form.geo.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              >
                <span className="mdi mdi-google-street-view" />
                Street View
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
