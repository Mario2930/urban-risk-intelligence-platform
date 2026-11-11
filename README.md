# 🏙️ Urban Risk Intelligence Platform

**Global Solution 2026.2 — Advanced Programming And Mobile Dev**  
**Curso:** Engenharia da Computação (3º Ano — 3EC) — FIAP

---

## 👥 Integrantes do Grupo
- **Mário Secundino Santana Lopes Portella** — RM: **555321**
- **Luis Fernando Picarelli Gonçalves Guariglia** — RM: **555458**

---

## 📌 Visão Geral do Projeto
A **Urban Risk Intelligence Platform** é uma plataforma integrada de monitoramento, análise e priorização em tempo real de riscos cotidianos em áreas urbanas:
1. **🌊 Alagamentos** (elevação de lâmina d'água em vias e córregos).
2. **🌡️ Ilhas de Calor** (anomalias térmicas severas e baixa umidade).
3. **⚡ Interrupções de Serviços Essenciais** (quedas de energia elétrica, semáforos inoperantes e falhas de abastecimento).

O sistema é entregue em um **monorepo** contendo as duas stacks integradas:
- **Backend (`/backend`):** API REST em **Java 17 + Spring Boot + Spring Data JPA + H2 Database (persistido em disco)**.
- **Frontend Mobile-Web (`/mobile`):** Aplicativo multiplataforma em **React Native + Expo + TypeScript + Axios**.

---

## 🎯 Para que serve cada funcionalidade do sistema?

### 1. Origem dos Dados e Nível de Confiança
O backend recebe e classifica eventos de três origens distintas, atribuindo um nível de confiança inicial (`confidenceLevel`) baseado na precisão da fonte:
- **📡 `SENSOR` (Sensores IoT Urbanos):** Confiança base de **94%**. Representa leituras diretas de hardware (ex.: sensores ultrassônicos de nível de água em centímetros).
- **🏛️ `BASE_PUBLICA` (Órgãos Oficiais):** Confiança base de **88%**. Representa dados meteorológicos e alertas da Defesa Civil ou Inmet (ex.: temperatura em graus Celsius).
- **👥 `COMUNIDADE` (Moradores e Agentes Locais):** Confiança base de **65%**. Representa relatos enviados manualmente pelo aplicativo.

### 2. Inteligência Analítica e Validação Cruzada (Priorização por IA/Heurística)
Localizado na camada `RiskAnalysisService`, o motor analítico avalia automaticamente cada novo evento antes de salvá-lo no banco:
- **Corroboração Cruzada (Validação Espacial):** Se um morador envia um relato comunitário (`65%` de confiança) em um bairro que já possui outros alertas ativos do mesmo tipo de risco, o algoritmo detecta a confirmação múltipla e **eleva automaticamente a confiança do dado em +12% por evento corroborado** (chegando até **98%**).
- **Cálculo do Score de Prioridade (`priorityScore` de 0 a 100):** Combina a severidade da leitura numérica, o peso de risco à vida do tipo de evento (Alagamento possui peso $1.25$, Interrupção $1.10$, Ilha de Calor $1.05$) e o nível de confiança da fonte.
- **Classificação Automática (`priorityLevel`):**
  - `CRITICO` (Score $\ge 80$) — Destaque vermelho imediato no topo do aplicativo.
  - `ALTO` (Score $60$ a $79$) — Destaque laranja.
  - `MEDIO` (Score $40$ a $59$) — Destaque amarelo.
  - `BAIXO` (Score $< 40$) — Destaque verde.

### 3. Proteção de Dados Pessoais (LGPD)
Nenhum dado pessoal sensível (CPF, nome, telefone ou endereço residencial) é coletado nos relatos comunitários. O sistema gera e armazena apenas hashes anonimizados (`reporterAnonId`, como `MORADOR-HASH-8F2A`), garantindo privacidade por padrão (*Privacy by Design*).

### 4. Para que servem os elementos e botões do Aplicativo Mobile?
- **🟢/🔴 Banner de Conexão e Resiliência (`ConnectionBanner`):** Faz *polling* automático no backend a cada 4 segundos, medindo a latência em milissegundos (`ms`). Se o backend cair ou for desligado, o banner muda para **🔴 BACKEND DESCONECTADO (MODO OFFLINE)** sem travar o aplicativo, mantendo o último estado seguro visível em cache na tela e reconectando sozinho assim que o servidor volta ao ar.
- **🚨 Notificação de Alerta Prioritário:** Exibe um aviso em destaque no topo sempre que há um evento de nível `CRITICO` ativo na cidade.
- **📊 Painel de Acompanhamento (`DashboardHeader`):** Mostra em tempo real o total de Alertas Críticos, Eventos Ativos, a Confiança Média dos dados e o status do Motor Analítico.
- **⚡ Botão `Simular IoT`:** Cumpre o requisito de recebimento de dados de sensores e bases públicas em tempo real. Ao clicar, dispara uma requisição para o backend gerar leituras simuladas de sensores IoT ou bases públicas em diferentes bairros, demonstrando a reordenação automática da lista por prioridade.
- **➕ Botão `Adicionar Relato`:** Abre o formulário acessível para moradores e agentes locais registrarem ocorrências reais, contando com **lista pesquisável de bairros de São Paulo** e envio anônimo.
- **🗑️ Botão `Resetar`:** Limpa os eventos criados durante testes de demonstração e restaura o banco de dados para os 3 eventos iniciais padrão.

---

## 🗂️ Arquitetura e Estrutura de Arquivos (Para que serve cada arquivo)

```text
urban-risk-intelligence-platform/
├── README.md                                  # Documentação completa do projeto
├── .gitignore                                 # Ignora builds (target, node_modules, .expo e banco local)
│
├── backend/                                   # Stack Backend (Java 17 + Spring Boot)
│   ├── pom.xml                                # Dependências Maven (Spring Web, Spring Data JPA, H2, JUnit)
│   ├── mvnw / mvnw.cmd                        # Executável do Maven Wrapper (dispensa instalar Maven global)
│   └── src/
│       ├── main/
│       │   ├── java/br/com/fiap/urbanrisk/
│       │   │   ├── UrbanriskApplication.java          # Classe principal que inicializa o servidor Spring Boot
│       │   │   ├── model/RiskEvent.java               # Entidade JPA que mapeia a tabela tb_risk_events no banco
│       │   │   ├── repository/RiskEventRepository.java# Interface JPA para buscas ordenadas por prioridade e bairro
│       │   │   ├── service/RiskAnalysisService.java   # Motor de IA/Heurística, cálculo de confiança e simulação IoT
│       │   │   └── controller/RiskEventController.java# Endpoints da API REST (/api/risks) com CORS habilitado
│       │   └── resources/
│       │       └── application.properties             # Configura a porta 8080 e persistência em arquivo do H2
│       └── test/
│           └── java/br/com/fiap/urbanrisk/
│               └── UrbanriskApplicationTests.java     # Testes automatizados JUnit 5 do motor de priorização
│
└── mobile/                                    # Stack Frontend Mobile (React Native + Expo + TypeScript)
    ├── package.json                           # Dependências do app (Expo, React Native, Axios, Web support)
    ├── App.tsx                                # Ponto de entrada do aplicativo que carrega a HomeScreen
    └── src/
        ├── types/risk.ts                      # Contratos e tipagens TypeScript (RiskEvent e DashboardIndicators)
        ├── services/api.ts                    # Cliente HTTP Axios com timeout de 3s para detecção rápida de queda
        ├── components/
        │   ├── ConnectionBanner.tsx           # Faixa de status Online/Offline com indicador de latência
        │   ├── DashboardHeader.tsx            # Cartões de indicadores consolidados do painel
        │   └── RiskCard.tsx                   # Cartão visual de cada evento com cores por severidade e confiança
        └── interfaces/
            └── HomeScreen.tsx                 # Tela principal com listagem priorizada, busca de bairros e ações
```

---

## 🚀 Passo a Passo Completo de Inicialização (Backend e Frontend)

### Pré-requisitos Instalados
- **Java JDK 17** (ou superior: 21 / 25)
- **Node.js 18+** e **npm**
- **Git** e **VS Code**

---

### Passo 1: Clonar o Repositório
Abra o terminal (PowerShell ou CMD) e execute:
```powershell
git clone https://github.com/SEU_USUARIO/urban-risk-intelligence-platform.git
cd urban-risk-intelligence-platform
```

---

### Passo 2: Como Iniciar o Backend (Spring Boot)

Você pode iniciar o Backend de **duas formas** (escolha a que preferir):

#### Opção A — Pelo Terminal (PowerShell) usando o Maven Wrapper:
1. Abra um terminal na pasta raiz do projeto e entre na pasta `backend`:
   ```powershell
   cd backend
   ```
2. (Opcional) Execute os testes unitários automatizados para validar as regras de negócio:
   ```powershell
   .\mvnw.cmd test
   ```
3. Inicie o servidor Spring Boot:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

#### Opção B — Pelo Botão "Run" do VS Code:
1. No VS Code, abra o arquivo `backend/src/main/java/br/com/fiap/urbanrisk/UrbanriskApplication.java`.
2. Clique no botão **`Run`** logo acima do método `public static void main(String[] args)`.

#### Como verificar se o Backend subiu corretamente:
- O terminal exibirá a mensagem `Tomcat started on port 8080 (http)` e `Started UrbanriskApplication`.
- Abra o navegador e acesse: **`http://localhost:8080/api/risks`** (você verá o JSON com os eventos priorizados).
- Painel de indicadores da API: **`http://localhost:8080/api/risks/dashboard`**

---

### Passo 3: Como Iniciar o Frontend Mobile (React Native + Expo)

Com o Backend rodando no primeiro terminal, abra um **segundo terminal** no VS Code:

1. A partir da pasta raiz `urban-risk-intelligence-platform`, entre na pasta `mobile`:
   ```powershell
   cd mobile
   ```
2. Instale todas as dependências do projeto (necessário apenas na primeira vez ou após clonar o repositório):
   ```powershell
   npm install
   ```
3. Inicie o aplicativo no navegador (Expo Web):
   ```powershell
   npx expo start --web
   ```
4. O navegador abrirá automaticamente em **`http://localhost:8081`** (caso não abra sozinho, pressione a tecla **`w`** no terminal do Expo).

*(Nota: Caso deseje testar em um celular físico pelo aplicativo Expo Go, basta alterar `localhost` para o endereço IPv4 do seu computador na rede Wi-Fi dentro do arquivo `mobile/src/services/api.ts`).*

---

## 🔌 Documentação dos Endpoints da API REST

| Método HTTP | Endpoint | Função |
| :--- | :--- | :--- |
| **`GET`** | `/api/risks` | Retorna a lista de todos os eventos ativos ordenados pelo maior `priorityScore` e data mais recente. |
| **`GET`** | `/api/risks/dashboard` | Retorna os indicadores consolidados (`totalEvents`, `criticalAlerts`, `averageConfidence` e status da IA). |
| **`POST`** | `/api/risks` | Recebe um novo evento (`SENSOR`, `BASE_PUBLICA` ou `COMUNIDADE`), executa o cálculo de confiança/prioridade e salva no banco H2. |
| **`POST`** | `/api/risks/simulate` | Gera e persiste uma leitura simulada de sensor ou base pública para testes em tempo real. |
| **`DELETE`** | `/api/risks/reset` | Limpa a base de testes e restaura os 3 eventos iniciais padrão. |

---

## 🎤 Roteiro para Demonstração na Apresentação (Global Solution)

1. **Consumo em Tempo Real:** Com o Backend e o App abertos lado a lado, clique em **`⚡ Simular IoT`** ou em **`➕ Adicionar Relato`** (pesquise e selecione o bairro *Ipiranga* e envie um relato para demonstrar a **Validação Cruzada** subindo o nível de confiança do alerta).
2. **Teste de Queda do Backend (Resiliência Offline):** Pare a execução do Spring Boot no VS Code (botão **Stop** ou `Ctrl + C` no terminal do backend). Em até 4 segundos, mostre que o banner do aplicativo muda para **🔴 BACKEND DESCONECTADO (MODO OFFLINE)** sem travar a interface e mantendo todos os alertas na tela.
3. **Reconexão Automática e Persistência:** Inicie o Spring Boot novamente. Em até 4 segundos após o servidor subir, o aplicativo se recupera sozinho, o banner volta para **🟢 SISTEMA CONECTADO EM TEMPO REAL** e todos os eventos cadastrados antes da queda permanecem salvos graças à persistência em arquivo do banco H2 (`./data/urbanriskdb`).