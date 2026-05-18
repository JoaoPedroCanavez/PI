# GymTrack Pro 🏋️‍♂️💪

[![gif do sistema funcionando](demonstracao.gif)](demonstracao.gif)

### Sistema SaaS de Gestão de Treinos e Evolução de Cargas

O **GymTrack Pro** é uma plataforma SaaS multi-tenant comportamental desenvolvida especificamente para academias e personal trainers. O sistema resolve o problema de gestão de fichas de musculação abandonando o modelo tradicional de fichas estáticas e adotando um ecossistema dinâmico dividido em duas frentes de atuação (Instrutor e Aluno) com isolamento rigoroso de contexto, segurança avançada e rastreamento histórico de performance.

---

## 📋 Funcionalidades Principais

### 🖥️ Módulo do Instrutor (Gestor Técnico)
* **Biblioteca de Templates Reutilizáveis:** O instrutor não precisa recriar treinos do zero para cada aluno. Ele monta uma biblioteca de modelos abstratos (Ex: *Hipertrofia Avançada A*, *Cardio Iniciante*) e os reutiliza.
* **Estratégia Atômica de Edição (Nested Updates):** Permite modificar completamente a estrutura de exercícios de um modelo pronto usando a estratégia de *Limpar e Recriar* dentro de transações de banco de dados totalmente seguras (Rollback automático em caso de falha).
* **Gestão Dinâmica de Catálogo:** Cadastro instantâneo de novos exercícios físicos diretamente pela interface gráfica, atualizando os seletores em tempo real (State Alignment).
* **Vinculação Exclusiva:** O instrutor gerencia e atribui rotinas apenas para os alunos que o escolheram ativamente como mentor técnico.

### 📱 Módulo do Aluno (Área de Performance)
* **Seleção de Mentor:** O aluno escolhe o seu instrutor oficial dentro da plataforma. Ao vincular-se, a sua área de treinos é sincronizada imediatamente com os modelos daquele profissional.
* **Rastreamento Time-Series de Cargas:** Substituição do modelo destrutivo de `UPDATE` por um sistema imutável de logs de peso. Sempre que o aluno supera uma carga, um novo registro cronológico é inserido, possibilitando análises reais de progressão.
* **Interface Glassmorphism Premium:** Design moderno com camadas translúcidas, desfoques de fundo e contraste focado na paleta corporativa **Azul Petróleo (`#344956`)**.

---

## 🛡️ Engenharia de Segurança & Boas Práticas

* **Proteção contra Ataques BOLA (Broken Object Level Authorization):** Travas rígidas na camada de serviços do Django interceptam as requisições HTTP e validam as propriedades relacionais no servidor. Mesmo que um usuário mal-intencionado altere IDs de payloads no Insomnia/Postman, o sistema barra modificações em dados de alunos vinculados a outros instrutores.
* **Autenticação por Cookies Seguros (JWT Stateless):** Os tokens de acesso e atualização (SimpleJWT) trafegam criptografados e protegidos por propriedades `HttpOnly`, `Secure` e política de `SameSite=Lax`, blindando a aplicação contra roubos via scripts de terceiros (Ataques XSS).
* **Ganchos de Alinhamento Reativo (React Effects):** O frontend conta com ganchos de prevenção de desconfiguração de estado (*State Desync*), garantindo que os seletores nunca apontem para referências nulas ou IDs zerados após mutações assíncronas de rede.

---

## 🚀 Arquitetura e Tecnologias

### Backend (Porta de Dados)
* **Python 3.x** & **Django Framework**
* **Django REST Framework (DRF)** para a construção de APIs limpas e previsíveis.
* **SimpleJWT** para gestão de tokens assinados por chaves assimétricas de segurança.
* **SQLite** para persistência relacional local (otimizada com `prefetch_related` e `select_related` para mitigar o gargalo de performance de *N+1 Queries*).

### Frontend (Relação com o Usuário)
* **React** com **TypeScript** e build engine via **Vite**.
* **TanStack Router** para controle de roteamento tipado baseado em arquivos estruturados.
* **Tailwind CSS** para estilização utilitária de alta performance e fidelidade visual.
* **Lucide React** para iconografia técnica moderna.

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
Antes de começar, certifique-se de que tem instalado na sua máquina:
* [Python 3.10 ou superior](https://www.python.org/)
* [Node.js 18 ou superior](https://nodejs.org/)
* Um gerenciador de pacotes de Node (Recomendado: `pnpm` ou `npm`)

---

### 1. Configurando e Executando o Backend (Django)

1.  Aceda à pasta do servidor de dados:
    ```
```text?code_stdout&code_event_index=2
README.md gerado com sucesso!

```bash
    cd BackEnd
    ```
2.  Crie um ambiente virtual isolado para as dependências do Python:
    ```bash
    python -m venv venv
    ```
3.  Ative o seu ambiente virtual:
    * **Linux/macOS:** `source venv/bin/activate`
    * **Windows (Command Prompt):** `venv\\Scripts\\activate`
    * **Windows (PowerShell):** `.\\venv\\Scripts\\Activate.ps1`
4.  Instale os pacotes necessários:
    ```bash
    pip install -r requirements.txt
    ```
5.  Gere as receitas de banco de dados e crie as tabelas físicas locais:
    ```bash
    python manage.py makemigrations user treino
    python manage.py migrate
    ```
6.  *(Opcional)* Crie uma conta administrativa master para gerenciar o painel do Django:
    ```bash
    python manage.py createsuperuser
    ```
7.  Inicie o servidor de desenvolvimento:
    ```bash
    python manage.py runserver
    ```
    O seu backend estará online escutando em: `http://localhost:8000/api/v1/`

> 🔒 **Nota de Segurança Importante:** No arquivo `BackEnd/nucleus/settings.py`, certifique-se de alterar a variável `SECRET_KEY` para uma chave de assinatura longa, complexa e robusta de pelo menos 32 bytes em ambientes públicos, mitigando ataques de força bruta contra assinaturas de tokens JWT.

---

### 2. Configurando e Executando o Frontend (React)

1.  Abra uma nova janela no seu terminal e aceda à pasta do cliente web:
    ```bash
    cd src
    ```
2.  Instale os pacotes e dependências de desenvolvimento do ecossistema Node:
    ```bash
    pnpm install
    # ou, caso use npm: npm install
    ```
3.  Inicie o servidor de desenvolvimento reativo:
    ```bash
    pnpm dev
    # ou, caso use npm: npm run dev
    ```
    O terminal fornecerá o link local da interface. Geralmente disponível em: `http://localhost:5173/`

---

## 🔑 Fluxo de Testes Recomendado

Para validar todas as regras de isolamento e segurança implementadas nas camadas de dados, siga este roteiro de testes:

1.  Abra a tela inicial (`/`), mude para o formulário de cadastro expandido e crie uma conta com o cargo **Instrutor** (Ex: `rafael_instrutor`).
2.  Crie uma segunda conta com o cargo **Aluno** (Ex: `lucas_aluno`).
3.  Entre com a conta do **Aluno** (`lucas_aluno`), aceda ao cartão superior de segurança e vincule o perfil ao `rafael_instrutor`.
4.  Efetue logout e entre com a conta do **Instrutor** (`rafael_instrutor`):
    * Aceda à Aba 1, adicione novos exercícios ao catálogo e monte alguns templates de treino.
    * Aceda à Aba 2 (Vinculação). Note que o aluno `lucas_aluno` aparecerá exclusivamente na sua listagem porque escolheu você. Selecione o template criado e clique em *Aplicar Ficha*.
5.  Volte para a conta do **Aluno** (`lucas_aluno`):
    * A sua prancha técnica com os exercícios aninhados estará renderizada perfeitamente.
    * Digite um peso no campo de carga de qualquer exercício e clique em enviar. O registro será injetado instantaneamente na tabela cronológica real de cargas do banco de dados!

---

## 📁 Estrutura de Pastas do Ecossistema

```text
├── BackEnd/                  # Estrutura do Servidor de Banco e API (Django)
│   ├── nucleus/              # Configurações centrais do ecossistema e chaves de segurança
│   ├── user/                 # Gestão de perfis, controle de permissões e roles
│   └── treino/               # Domínio relacional de exercícios, templates, atribuições e logs
│
└── src/                      # Estrutura da Aplicação SPA (React + TypeScript)
    ├── src/lib/              # Contratos de APIs, fetchers assíncronos e utilitários
    ├── src/services/         # Isolação de chamadas globais de rede e interceptores
    └── src/routes/           # Telas acopladas baseadas em arquivos dinâmicos (TanStack Router)