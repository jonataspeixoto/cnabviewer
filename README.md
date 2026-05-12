# 🚀 CNAB240 Audit Viewer & Editor

O **CNAB Viewer** é um processador de arquivos bancários CNAB240 de ultra performance, projetado para auditoria visual rigorosa e edição de dados com precisão cirúrgica. Construído com **React**, **Zustand** e uma arquitetura de renderização otimizada para lidar com arquivos massivos.

---

## 💎 Diferenciais Técnicos

### 1. Motor de Renderização Localizada
Diferente de editores comuns, o CNAB Viewer utiliza um sistema de **Prop-Drilling Seletivo** e **Granularidade de Estado**.
- **Performance O(1)**: O custo de renderização ao editar um campo é constante, independente do tamanho do arquivo (10 ou 100.000 linhas).
- **Virtualização Inteligente**: Renderiza apenas o que está visível na viewport, mantendo o uso de memória extremamente baixo.

### 2. Precisão Milimétrica (1CH Grid)
A edição "In-Place" utiliza cálculos dinâmicos baseados na unidade `ch` (largura do caractere 0).
- **Cálculo de Clique Dinâmico**: O sistema mede a largura real do campo renderizado e calcula a posição do cursor baseada no 1ch exato do navegador, garantindo que o cursor caia exatamente onde você clicou.
- **Espelhamento de Input**: Um sistema de camadas (layers) permite que você edite o texto enquanto vê os caracteres especiais (pontos de espaço) por baixo, mantendo a estética monospaçada.

### 3. Auditoria Multi-Threaded
A validação dos arquivos ocorre em um **Web Worker** separado.
- **Background Auditing**: A análise de erros (CPF, CNPJ, datas, sequenciais) não trava a interface principal.
- **Audit Engine**: Baseado em schemas modulares que definem cada campo, posição inicial, final e regras de validação.

---

## 📂 Estrutura do Projeto (A Árvore de Coisas Úteis)

```text
src/
├── components/
│   ├── CnabExplorer.jsx     # O coração da virtualização e grid principal.
│   ├── CnabLine.jsx         # Componente atômico com lógica de edição e precisão de clique.
│   ├── EditorPanel.jsx      # Painel de detalhes para edição assistida.
│   ├── AuditPanel.jsx       # Interface de resultados do Web Worker de auditoria.
│   └── Dropzone.jsx         # Handler de drag-and-drop com parsing inicial.
├── store/
│   └── useCnabStore.js      # Gerenciamento de estado (Zustand) com History (Undo/Redo).
├── utils/cnab/
│   ├── engine.js            # O cérebro que conhece o layout CNAB240.
│   ├── audit.worker.js      # Worker que executa a auditoria em paralelo.
│   ├── rules.js             # Biblioteca de regras de validação (CPF, Bancos, etc).
│   └── schemas/             # Definição técnica de cada segmento (A, B, J, P, Q, etc).
└── styles/
    └── index.css            # Design System (Glassmorphism, Tailwind v4).
```

---

## 🛠️ Como o Motor Funciona

### Fluxo de Edição:
1. **Click**: O `handleFieldClick` calcula o `offset` baseado na largura real do elemento.
2. **Focus**: A Store atualiza `focusedField` e `selectedLineIndex` de forma atômica.
3. **Render**: Apenas a linha afetada re-renderiza (memoization).
4. **Commit**: Ao sair do campo ou dar Enter, o `updateLine` é disparado, gerando um novo estado e adicionando ao histórico de Undo.

### Sistema de Auditoria:
Os schemas em `utils/cnab/schemas/` definem o contrato. O motor percorre as linhas e aplica os validadores de `rules.js`. Erros são reportados com IDs de campo, permitindo que a `CnabLine` destaque visualmente onde está o problema.

---

## 📦 Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em modo dev
npm run dev
```

---

## 📜 Licença
Desenvolvido para auditoria de alta precisão em ambientes bancários.
