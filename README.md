# 🚀 CNAB240 Audit Viewer & Editor

O **CNAB Viewer** é um processador de arquivos bancários CNAB240 de ultra performance, projetado para auditoria visual rigorosa e edição de dados com precisão cirúrgica. 

Construído com **React 19**, **Zustand** e uma arquitetura de renderização otimizada para lidar com arquivos massivos (100k+ linhas) sem travamentos.

---

## 💎 Visão Geral e Diferenciais

### ⚙️ Como a Aplicação Funciona
A aplicação opera em três camadas principais:
1.  **Interface (UI)**: Utiliza **Virtualização de Lista** para renderizar apenas os caracteres visíveis na tela. Isso permite abrir arquivos de megabytes instantaneamente.
2.  **Estado Global (Zustand)**: Gerencia o conteúdo do arquivo bruto (`rawLines`), o histórico de alterações (Undo/Redo) e os resultados da auditoria.
3.  **Motor de Auditoria (Web Worker)**: Um processo em segundo plano que executa 170+ validações sem bloquear a interface. Ele é **contextual**, ou seja, entende que o Segmento A de um lote de "Pagamento de Salários" tem regras diferentes de um Segmento A de "Transferência PIX".

### 🚀 Performance O(N)
Recentemente otimizado, o motor de auditoria processa o arquivo em uma única passagem linear. Ele rastreia o contexto do lote (Header de Lote) dinamicamente, garantindo que arquivos gigantes sejam auditados em milissegundos.

---

## 📂 Estrutura do Projeto (Modular)

```text
src/
├── components/
│   ├── CnabLine/            # Componente ultra-otimizado para cada linha do CNAB.
│   │   ├── index.jsx        # Lógica de renderização virtualizada.
│   │   ├── CnabField.jsx    # Renderizador de campo com visual whitespace.
│   │   └── useCnabLineLogic.js # Hook de performance para evitar re-renders.
│   ├── AppHeader.jsx        # Controles globais e upload.
│   ├── CnabExplorer.jsx     # Grid principal com suporte a redimensionamento.
│   └── AuditPanel.jsx       # Interface de feedback em tempo real do Worker.
├── hooks/
│   └── useResizable.js      # Gerenciador de layout dinâmico (Painéis).
├── store/
│   └── useCnabStore.js      # Estado central com suporte a histórico (Undo/Redo).
├── utils/cnab/
│   ├── engine.js            # Identificador dinâmico de segmentos e sub-layouts.
│   ├── audit_logic.js       # Core da auditoria linear (Web Worker).
│   ├── rules/               # Biblioteca de validação FEBRABAN.
│   │   ├── validators.js    # Funções de validação (CPF, CNPJ, PIX, Datas).
│   │   └── definitions/     # Regras mapeadas por domínio (Pagamentos, Pix, etc).
│   └── schemas/             # Definições técnicas de posição (1-240) para cada segmento.
```

---

## 🛠️ Execução Local

### Pré-requisitos
- **Node.js**: Versão 18 ou superior.
- **npm** ou **yarn**.

### Passo a Passo
```bash
# 1. Clone o repositório e entre na pasta
# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. (Opcional) Rode a suite de testes (170+ testes)
npm test
```

A aplicação estará disponível em `http://localhost:5173`.

---

## 📦 Dependências Principais

- **React 19**: Base da interface e componentes.
- **Zustand**: Gerenciamento de estado leve e rápido.
- **Vite**: Build system de última geração.
- **Tailwind CSS 4**: Estilização moderna e utilitária.
- **Mermaid.js**: Renderização de diagramas de fluxo nos manuais técnicos.
- **Vitest**: Framework de testes ultra-rápido para validação das regras bancárias.
- **Lucide React**: Biblioteca de ícones premium.

---

## 🛡️ Auditoria e Conformidade
O sistema valida automaticamente:
- **Estrutura de Arquivo**: Lotes obrigatórios (`0000` no Header e `9999` no Trailer).
- **Sequencial de Lote**: Garante que nenhum registro foi pulado ou está fora de ordem.
- **Campos Específicos**: Validação de chaves PIX, datas futuras, tipos de inscrição e DVs bancários.
- **Contagem de Registros**: Verifica se o Trailer de Lote/Arquivo condiz com a realidade do arquivo.

---

---

## 📜 Licença
Este projeto está licenciado sob a **Licença MIT**. Sinta-se à vontade para usar, modificar e distribuir conforme necessário. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

Desenvolvido com foco em auditoria de alta precisão para o ecossistema bancário brasileiro.
