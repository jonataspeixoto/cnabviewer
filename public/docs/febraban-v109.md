# Documentação Técnica CNAB240 v10.9 (Resumo)

Esta documentação descreve as regras de validação e estruturas dinâmicas implementadas no **CNAB Viewer**.

## 1. Segmentos Dinâmicos

O sistema identifica o layout automaticamente com base na **Forma de Lançamento** (posições 12-13 do Header de Lote).

### Segmento B
- **PIX (45/47)**: Ativa o campo **Forma de Iniciação (G100)** e desmembra o bloco de informações complementares em campos específicos (Chave Pix, TXID, etc).
- **Débito em Conta ('D')**: Transforma o campo de iniciação em **Filler (G004)** e ajusta os labels para "Inscrição do Pagador".
- **Crédito Comum (01, 03)**: Mantém o campo de iniciação como **Filler (G004)** para permitir preenchimento em branco sem erros de validação.

### Segmento N
- Suporta variações para **GPS**, **DARF Comum**, **DARF Simples** e **Veículos Estaduais**, dependendo da forma de lançamento.

## 2. Regras de Validação (G-Rules)

### G006 - Inscrição (CPF/CNPJ)
Validação algorítmica completa.
- Detecta automaticamente se o valor é CPF ou CNPJ pelo tamanho e composição.
- Suporta campos de 15 posições com zero à esquerda.

### G016 - Data
Formato: `DDMMAAAA`.
- Valida existência da data e anos bissextos.
- Permite "00000000" como valor nulo válido.

### G100 - Forma de Iniciação Pix
Valores aceitos:
- `01`: Telefone
- `02`: E-mail
- `03`: CPF/CNPJ
- `04`: Chave Aleatória
- `05`: Dados Bancários
- `06`: QR Code Dinâmico
- `07`: QR Code Estático

---
*Documento gerado automaticamente pelo assistente Antigravity.*