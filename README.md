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
- **Cálculo de Clique Dinâmico**: O sistema mede a largura real do campo renderizado e calcula a posição do cursor baseada no 1ch exato do navegador.
- **Espelhamento de Input**: Um sistema de camadas permite editar o texto enquanto vê os caracteres especiais (visual whitespace) por baixo.

### 3. Auditoria Contextual Multi-Threaded
A validação ocorre em um **Web Worker** e é sensível ao contexto do lote.
- **Smart PIX Validation**: O motor identifica a "Forma de Iniciação" (G100) e valida chaves PIX de acordo com o tipo (E-mail, CPF/CNPJ, Telefone ou UUID).
- **Sub-layouts Dinâmicos**: O sistema alterna automaticamente entre layouts de Boleto, PIX ou Tributos (GPS/DARF) baseado nos códigos de movimento do Header de Lote.
- **Rigor Alfanumérico**: Diferencia campos de texto simples (sem acentos/símbolos) de campos especiais que permitem caracteres como `@`, `.`, `/`, `-` (Chaves PIX e URLs).

### 4. Documentação Técnica Integrada
Visualizador de manuais FEBRABAN integrado com suporte a:
- **Mermaid.js**: Renderização de diagramas de fluxo de remessa/retorno.
- **Navegação via Índice**: Links inteligentes que levam diretamente às seções e regras (Gxxx, Cxxx) do manual.

---

## 📂 Estrutura do Projeto

```text
src/
├── components/
│   ├── CnabExplorer.jsx     # Virtualização e grid principal.
│   ├── DocumentationPanel.jsx # Renderer de manuais com Mermaid.js.
│   ├── EditorPanel.jsx      # Painel lateral para edição assistida.
│   └── AuditPanel.jsx       # Interface de resultados da auditoria.
├── store/
│   └── useCnabStore.js      # Estado (Zustand) com History (Undo/Redo).
├── utils/cnab/
│   ├── engine.js            # Cérebro que gerencia sub-layouts dinâmicos.
│   ├── rules.js             # Biblioteca de regras inteligentes (CPF, PIX, etc).
│   └── schemas/             # Definições técnicas de cada segmento.
└── services/
    └── DocService.js        # Parser de Markdown com indexação de regras.
```

---

## 🛠️ Desenvolvimento e Testes

O projeto utiliza **Vitest** para garantir a integridade dos cálculos de auditoria e parsing de schemas.

```bash
# Instalar dependências
npm install

# Rodar testes unitários
npm test

# Rodar em modo dev
npm run dev
```

---

## 📜 Licença
Desenvolvido para auditoria de alta precisão em ambientes bancários.
