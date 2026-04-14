# 💈 SaaS Barbearia

![Build](https://img.shields.io/badge/build-in%20progress-yellow)
![Status](https://img.shields.io/badge/status-active-success)
![Backend](https://img.shields.io/badge/backend-NestJS-red)
![Frontend](https://img.shields.io/badge/frontend-React-blue)
![Mobile](https://img.shields.io/badge/mobile-React%20Native-61DAFB)
![Database](https://img.shields.io/badge/database-MongoDB%20Atlas-green)
![Storage](https://img.shields.io/badge/storage-AWS%20S3-orange)
![License](https://img.shields.io/badge/license-private-lightgrey)

Sistema completo para gestão de barbearias com painel administrativo e aplicativo mobile para clientes, no modelo marketplace.

---

## 🚀 Visão Geral

Este projeto consiste em uma plataforma SaaS voltada para barbearias, permitindo:

* Gestão de clientes
* Controle de agendamentos
* Cadastro de serviços e colaboradores
* Integração com pagamentos
* Upload e gerenciamento de imagens

Além disso, conta com um aplicativo mobile onde clientes podem encontrar barbearias e agendar serviços.

---

## 🧱 Arquitetura

A aplicação segue uma arquitetura moderna, escalável e desacoplada:

* **Backend:** NestJS (API REST)
* **Frontend Web:** React (Dashboard administrativo)
* **Mobile:** React Native (App do cliente)
* **Banco de Dados:** MongoDB (NoSQL)
* **Storage:** AWS S3 (armazenamento de imagens)

---

## ⚙️ Funcionalidades

### 👤 Usuários

* Cadastro e autenticação
* Atualização de perfil
* Upload de imagem de perfil

### 📅 Agendamentos

* Criação e gerenciamento de horários
* Visualização em calendário
* Controle por barbearia e colaborador

### 💼 Serviços

* Cadastro de serviços
* Definição de preço e duração

### 👨‍🔧 Colaboradores

* Cadastro de profissionais
* Associação com serviços

### 💳 Pagamentos

* Integração com gateway de pagamento
* Criação de contas (recipients)
* Controle de transações

### 🖼️ Upload de Imagens

* Upload para bucket S3
* Armazenamento de URL no banco
* Substituição de arquivos existentes

---

## 🔐 Autenticação

* Autenticação baseada em token
* Armazenamento no frontend (sessionStorage)
* Proteção de rotas

---

## ▶️ Como Rodar o Projeto

### 📌 Pré-requisitos

* Node.js (>= 18)
* npm ou yarn
* Conta no MongoDB Atlas
* Conta AWS (S3 configurado)

---

### 🔧 Backend (NestJS)

```bash
cd backend
npm install

# configurar variáveis de ambiente
cp .env.example .env

# desenvolvimento
npm run start:dev

# produção
npm run build
npm run start:prod
```

---

### 🌐 Frontend (React)

```bash
cd frontend
npm install

# desenvolvimento
npm start

# build
npm run build
```

---

### 📱 Mobile (React Native)

```bash
cd mobile
npm install

# iniciar metro
npm start

# rodar android
npm run android

# rodar ios
npm run ios
```

---

### 🔐 Variáveis de Ambiente (exemplo)

```env
# Backend
PORT=3000
MONGODB_URI=your_mongodb_atlas_url
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET_NAME=your_bucket
AWS_REGION=your_region
JWT_SECRET=your_secret
```

---

## 📦 Estrutura do Projeto

```
backend/
  ├── src/
  ├── modules/
  ├── services/
  └── controllers/

frontend/
  ├── src/
  ├── components/
  ├── pages/
  └── store/

mobile/
  ├── src/
  ├── screens/
  └── components/
```

---

## 🌐 Fluxo de Upload (S3)

1. Usuário seleciona imagem no frontend
2. Arquivo é enviado para o backend
3. Backend faz upload para o S3
4. S3 retorna a URL pública
5. URL é salva no banco de dados

---

## 💰 Fluxo de Pagamento

1. Cliente agenda um serviço
2. Backend cria transação
3. Integração com gateway de pagamento
4. Confirmação e registro da transação

---

## 🛠️ Tecnologias Utilizadas

* Node.js
* NestJS
* MongoDB + Mongoose
* React
* React Native
* Redux
* AWS S3

---

## 📌 Status do Projeto

🚧 Em desenvolvimento

* Painel administrativo em evolução
* App mobile em desenvolvimento
* Integrações sendo refinadas

---

## 🎯 Próximos Passos

* Finalizar fluxo completo de agendamento no mobile
* Melhorar UX/UI do dashboard
* Implementar notificações (push/email)
* Refinar segurança (roles e permissões)
* Otimizar deploy e escalabilidade

---

## 📄 Licença

Este projeto é de uso privado para fins de estudo e desenvolvimento.

---

## 👨‍💻 Autor

Desenvolvido por Ítalo Sampaio
