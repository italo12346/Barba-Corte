import { all, call, put, takeLatest, select } from "redux-saga/effects";
import api from "../../../services/api";
import types from "./types";

/**
 * Função auxiliar para buscar as coordenadas geográficas (lat/lng) a partir do endereço.
 * Usa a API do OpenStreetMap (Nominatim) - Gratuita.
 */
async function getGeoLocation(endereco) {
  try {
    const { logradouro, numero, cidade, uf, cep } = endereco;
    const query = `${logradouro}, ${numero}, ${cidade}, ${uf}, ${cep}, Brasil`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      // O GeoJSON do MongoDB usa [longitude, latitude]
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar geolocalização:", error);
    return null;
  }
}

/**
 * Worker unificado para atualizar o perfil.
 */
export function* updatePerfil({ payload }) {
  try {
    console.log("Saga interceptou a Action com payload:", payload);

    const { 
      nome, email, telefone, logradouro, cidade, uf, cep, numero, 
      senhaAtual, novaSenha, fotoFile, geo 
    } = payload;

    // Obtém o ID do salão do estado global (auth)
    const auth = yield select((state) => state.auth);
    const salaoId = auth.salao?._id;

    if (!salaoId) {
      throw new Error("ID do salão não encontrado no estado global.");
    }

    // 1. Cria o FormData
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("telefone", telefone);
    
    const endereco = { logradouro, cidade, uf, cep, numero, pais: "Brasil" };
    formData.append("endereco", JSON.stringify(endereco));

    if (senhaAtual && novaSenha) {
      formData.append("senhaAtual", senhaAtual);
      formData.append("novaSenha", novaSenha);
    }

    if (fotoFile) {
      formData.append("foto", fotoFile);
    }

    // 2. Lógica de Geolocalização (Prioriza o geo manual do mapa)
    let finalGeo = geo;

    // Se não houver geo manual (ex: primeira vez preenchendo o endereço), busca via API
    if (!finalGeo && cep && cidade) {
      const coordinates = yield call(getGeoLocation, endereco);
      if (coordinates) {
        finalGeo = {
          type: "Point",
          coordinates
        };
      }
    }

    // 3. Adiciona o geo final ao FormData
    if (finalGeo) {
      formData.append("geo", JSON.stringify(finalGeo));
    }

    console.log("Fazendo chamada para a API PUT /salao/" + salaoId);

    // 4. Faz a chamada única para a API
    const { data } = yield call(api.put, `/salao/${salaoId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (data.error) {
      yield put({ 
        type: types.UPDATE_PERFIL_FAILURE, 
        payload: data.message || "Erro ao atualizar perfil" 
      });
    } else {
      yield put({ 
        type: types.UPDATE_PERFIL_SUCCESS, 
        payload: data.salao 
      });
    }
  } catch (err) {
    console.error("Erro no Saga:", err);
    const msg = err?.response?.data?.message || err.message || "Erro ao atualizar perfil";
    yield put({ 
      type: types.UPDATE_PERFIL_FAILURE, 
      payload: msg 
    });
  }
}

export default function* perfilSaga() {
  yield all([
    takeLatest(types.UPDATE_PERFIL_REQUEST, updatePerfil),
  ]);
}
