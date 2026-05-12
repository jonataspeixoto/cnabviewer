# CNAB240 Audit Viewer & Editor

Um processador de arquivos CNAB240 de alta performance, projetado para auditoria visual e edição de dados com precisão milimétrica.

## 🚀 Principais Funcionalidades

- **Editor In-Place de Alta Fidelidade**: Edite campos do CNAB diretamente no grid com espelhamento de caracteres e preservação de cursor.
- **Visualização Estilo Notepad++**: Exibição opcional de espaços em branco e caracteres invisíveis para conferência rigorosa.
- **Motor de Performance**: Gerenciamento de estado via Delta-History (Zustand), capaz de processar arquivos grandes sem latência de interface.
- **Auditoria em Tempo Real**: Painel de validação automática baseado em regras configuráveis (CPF/CNPJ, datas, tipos numéricos, etc).
- **Design Premium**: Interface dark mode moderna com glassmorphism e animações suaves.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React (Vite)
- **Estado Global**: Zustand
- **Estilização**: TailwindCSS + CSS Grid
- **Ícones**: Lucide React

## 🔧 Configurações do Desenvolvedor

O sistema inclui um utilitário de log centralizado em `src/utils/logger.js`. Para ativar logs detalhados de processamento no console, certifique-se de que `IS_DEBUG` está definido como `true`.

## 📦 Como Executar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```

## 📖 Notas Técnicas

- **Unidades `ch`**: O sistema utiliza métricas baseadas na largura real do caractere da fonte (Consolas/Monaco) para garantir que a seleção e o grid nunca sofram drift.
- **Régua de 240 Posições**: Uma linha guia visual é renderizada exatamente no limite do padrão CNAB240 para validação rápida de layout.
