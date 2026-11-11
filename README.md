# 🏙️ Urban Risk Intelligence Platform
**Global Solution 2026.2 — Advanced Programming And Mobile Dev (FIAP)**

## 👥 Integrantes do Grupo
- **[Nome Completo Integrante 1]** — RM: **[RM 1]**
- **[Nome Completo Integrante 2]** — RM: **[RM 2]**
- **[Nome Completo Integrante 3]** — RM: **[RM 3]**

## 📌 Descrição do Projeto
Plataforma integrada de monitoramento e análise de riscos urbanos (alagamentos, ilhas de calor e interrupções de serviços essenciais), composta por backend em **Java com Spring Boot** e aplicativo mobile em **React Native (Expo + TypeScript)**.

### 🧠 Inteligência Analítica e Priorização
- **Confiabilidade por Origem (`confidenceLevel`):** Sensores IoT (`94%`), Bases Públicas (`88%`) e Relatos Comunitários (`65%`).
- **Validação Cruzada:** Eleva automaticamente o nível de confiança quando múltiplos relatos apontam o mesmo risco no mesmo bairro.
- **Score de Prioridade (`0–100`):** Ordena alertas em `CRITICO`, `ALTO`, `MEDIO` e `BAIXO`.
- **Proteção de Dados (LGPD):** Identificadores anonimizados sem coleta de dados pessoais.

## 🚀 Instruções de Execução

### 1. Backend (Spring Boot)
```powershell
cd backend
.\mvnw.cmd spring-boot:run

- Endpoints: http://localhost:8080/api/risks e http://localhost:8080/api/risks/dashboard

- Executar testes JUnit: .\mvnw.cmd test