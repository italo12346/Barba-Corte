const express = require("express");
const mongoose = require("mongoose");
const Busboy = require("busboy");

const router = express.Router();

const awsService = require("../services/aws");
const Salao = require("../models/salao");
const Servicos = require("../models/servico");
const Arquivos = require("../models/arquivo");

/* ===============================
   CRIAR SALÃO
=============================== */


router.post("/upload", async (req, res) => {
  try {
    if (!req.headers["content-type"]?.includes("multipart/form-data")) {
      return res.status(400).json({
        error: true,
        message: "Request precisa ser multipart/form-data",
      });
    }

    const busboy = Busboy({ headers: req.headers });

    const filePromises = [];

    /* =========================================
       CAPTURA DOS ARQUIVOS
    ========================================= */
    busboy.on("file", (fieldname, file, info) => {
      const { filename, mimeType } = info;

      if (!filename) {
        file.resume();
        return;
      }

      const promise = new Promise((resolve, reject) => {
        const chunks = [];
        let tamanho = 0;

        file.on("data", (chunk) => {
          chunks.push(chunk);
          tamanho += chunk.length;
        });

        file.on("end", () => {
          resolve({
            filename,
            mimeType,
            buffer: Buffer.concat(chunks),
            tamanho,
            fieldname, // 🔥 foto | capa
          });
        });

        file.on("error", reject);
      });

      filePromises.push(promise);
    });

    /* =========================================
       FINALIZAÇÃO
    ========================================= */
    busboy.on("finish", async () => {
      try {
        const salaoId = req.salaoId; 
        console.log(salaoId);
        
        const files = await Promise.all(filePromises);

        if (!files.length) {
          return res.status(400).json({
            error: true,
            message: "Nenhum arquivo enviado",
          });
        }

        const salaoDoc = await Salao.findById(salaoId);

        if (!salaoDoc) {
          return res.status(404).json({
            error: true,
            message: "Salão não encontrado",
          });
        }

        /* =========================================
           REMOVE ARQUIVOS ANTIGOS
        ========================================= */
        const arquivosAntigos = await Arquivos.find({
          referenciaId: salaoId,
          model: "Salao",
        });

        for (const arquivo of arquivosAntigos) {
          await awsService.deleteFromS3(arquivo.caminhoArquivo);
          await arquivo.deleteOne();
        }

        /* =========================================
           UPLOAD PARA S3
        ========================================= */
        const arquivosDocs = [];
        const updateData = {};

        for (const f of files) {
          const ext = f.filename.split(".").pop();

          const key = `saloes/${salaoId}/${f.fieldname}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.${ext}`;

          const upload = await awsService.uploadBufferToS3(
            f.buffer,
            key,
            f.mimeType
          );

          if (upload.error) {
            throw new Error(upload.message);
          }

          const url = `${process.env.S3_BUCKET}/${key}`;

          arquivosDocs.push({
            referenciaId: salaoId,
            model: "Salao",
            nome: f.filename,
            descricao: f.fieldname, // 🔥 foto | capa
            caminhoArquivo: url,
            tipoMime: f.mimeType,
            tamanho: f.tamanho,
          });

          // 🔥 atualiza dinamicamente
          if (f.fieldname === "foto") {
            updateData.foto = url;
          }

          if (f.fieldname === "capa") {
            updateData.capa = url;
          }
        }

        await Arquivos.insertMany(arquivosDocs);

        /* =========================================
           ATUALIZA SALÃO
        ========================================= */
        await Salao.findByIdAndUpdate(salaoId, updateData);

        return res.status(200).json({
          error: false,
          message: "Upload realizado com sucesso",
          ...updateData, // 🔥 retorna foto e/ou capa direto
        });

      } catch (err) {
        console.error("Erro no upload salão:", err);
        return res.status(500).json({
          error: true,
          message: err.message,
        });
      }
    });

    req.pipe(busboy);

  } catch (err) {
    console.error("Erro geral upload salão:", err);
    res.status(500).json({
      error: true,
      message: "Erro interno no upload",
    });
  }
});
/* ===============================
   LISTAR SERVIÇOS DO SALÃO
=============================== */

router.get("/servico/:salaoId", async (req, res) => {
  try {

    const { salaoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(salaoId)) {
      return res.status(400).json({
        error: true,
        message: "ID do salão inválido"
      });
    }

    const servicos = await Servicos.find({
      salaoId,
      status: "A"
    }).select("_id titulo");

    res.json({
      error: false,
      total: servicos.length,
      servicos: servicos.map(s => ({
        id: s._id,
        titulo: s.titulo
      }))
    });

  } catch (err) {

    console.error("Erro ao buscar serviços:", err);

    res.status(500).json({
      error: true,
      message: "Erro ao buscar serviços"
    });
  }
});

/* ===============================
   BUSCAR PERFIL COMPLETO
=============================== */
router.get("/perfil/:id", async (req, res) => {
  try {
    const { id } = req.params;
 
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "ID inválido" });
    }
 
    const salao = await Salao.findById(id).select("-senha");
 
    if (!salao) {
      return res.status(404).json({ error: true, message: "Salão não encontrado" });
    }
 
    res.json({ error: false, salao });
  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    res.status(500).json({ error: true, message: "Erro ao buscar perfil" });
  }
});
 
/* ===============================
   ATUALIZAR PERFIL COMPLETO (PUT /:id)
=============================== */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Recebida requisição PUT para o ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "ID inválido" });
    }

    if (!req.headers["content-type"]?.includes("multipart/form-data")) {
      return res.status(400).json({
        error: true,
        message: "Request precisa ser multipart/form-data",
      });
    }

    const busboy = Busboy({ headers: req.headers });
    const fields = {};
    let filePromise = null;

    // ── Captura campos de texto ───────────────────────────────────────────
    busboy.on("field", (fieldname, val) => {
      console.log(`Recebido campo [${fieldname}]:`, val);
      try {
        if (typeof val === 'string' && (val.startsWith("{") || val.startsWith("["))) {
          fields[fieldname] = JSON.parse(val);
        } else {
          fields[fieldname] = val;
        }
      } catch (e) {
        console.warn(`Erro ao fazer parse do campo ${fieldname}, salvando como string.`);
        fields[fieldname] = val;
      }
    });

    // ── Captura arquivo (foto) ────────────────────────────────────────────
    busboy.on("file", (fieldname, file, info) => {
      const { filename, mimeType } = info;
      console.log(`Recebido arquivo [${fieldname}]:`, filename);
      
      if (!filename) {
        file.resume();
        return;
      }

      filePromise = new Promise((resolve, reject) => {
        const chunks = [];
        file.on("data", (chunk) => chunks.push(chunk));
        file.on("end", () => {
          console.log(`Leitura do arquivo ${filename} concluída.`);
          resolve({
            filename,
            mimeType,
            buffer: Buffer.concat(chunks),
            fieldname
          });
        });
        file.on("error", (err) => {
          console.error("Erro na leitura do arquivo:", err);
          reject(err);
        });
      });
    });

    busboy.on("finish", async () => {
      try {
        console.log("Busboy finalizou o parsing. Iniciando processamento no banco...");
        const updateData = { ...fields };

        // 1. Tratamento de Senha
        if (updateData.novaSenha) {
          if (!updateData.senhaAtual) {
            return res.status(400).json({ error: true, message: "Informe a senha atual" });
          }

          const salao = await Salao.findById(id);
          if (!salao) return res.status(404).json({ error: true, message: "Salão não encontrado" });

          const senhaCorreta = await bcrypt.compare(updateData.senhaAtual, salao.senha);
          if (!senhaCorreta) {
            return res.status(400).json({ error: true, message: "Senha atual incorreta" });
          }

          updateData.senha = await bcrypt.hash(updateData.novaSenha, 10);
        }

        // Limpa campos auxiliares
        delete updateData.novaSenha;
        delete updateData.senhaAtual;

        // 2. Upload de Foto (se houver)
        if (filePromise) {
          const f = await filePromise;
          const ext = f.filename.split(".").pop();
          const key = `saloes/${id}/foto-${Date.now()}.${ext}`;

          console.log("Fazendo upload da foto para o S3...");
          const upload = await awsService.uploadBufferToS3(f.buffer, key, f.mimeType);
          
          if (upload.error) {
            console.error("Erro no S3:", upload.message);
            throw new Error(upload.message);
          }

          const url = `${process.env.S3_BUCKET}/${key}`;
          updateData.foto = url;

          // Registrar no model Arquivos
          await Arquivos.deleteMany({ referenciaId: id, model: "Salao", descricao: "foto" });
          await Arquivos.create({
            referenciaId: id,
            model: "Salao",
            nome: f.filename,
            descricao: "foto",
            caminhoArquivo: url,
            tipoMime: f.mimeType,
          });
          console.log("Foto atualizada com sucesso no S3 e banco.");
        }

        // 3. Salva no Banco
        // O Mongoose já aceitará o campo logradouro dentro do objeto endereco 
        // se o Schema permitir (como configuramos no início)
        console.log("Dados finais para o Mongoose:", JSON.stringify(updateData, null, 2));
        
        const salaoAtualizado = await Salao.findByIdAndUpdate(id, updateData, {
          new: true,
          select: "-senha",
        });

        console.log("Perfil atualizado com sucesso!");
        return res.json({ error: false, salao: salaoAtualizado });

      } catch (err) {
        console.error("ERRO DETALHADO NO FINISH DO BUSBOY:", err);
        return res.status(500).json({ error: true, message: err.message });
      }
    });

    req.pipe(busboy);

  } catch (err) {
    console.error("ERRO GERAL NA ROTA PUT:", err);
    res.status(500).json({ error: true, message: "Erro interno no servidor" });
  }
});

 
module.exports = router;
