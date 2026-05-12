export const CNAB_SCHEMA_SEGMENTO_O = {
  // 9. SEGMENTO O - Pagamento de Contas e Tributos com Código de Barras (Manual Pág. 35)
  segmento_o: {
    id: "segmento_o",
    label: "Segmento O - Contas e Tributos (Cód. Barras)",
    fields: [
      { name: "codigo_banco", ruleId: "G001", start: 1, end: 3, type: "N", label: "Código do Banco" },
      { name: "lote_servico", ruleId: "G002", start: 4, end: 7, type: "N", label: "Lote de Serviço" },
      { name: "tipo_registro", ruleId: "G003", start: 8, end: 8, type: "N", label: "Tipo de Registro", default: "3" },
      { name: "numero_sequencial", ruleId: "G038", start: 9, end: 13, type: "N", label: "Nº Sequencial no Lote" },
      { name: "codigo_segmento", ruleId: "G039", start: 14, end: 14, type: "A", label: "Código Segmento", default: "O" },
      { name: "tipo_movimento", ruleId: "G060", start: 15, end: 15, type: "N", label: "Tipo de Movimento" },
      { name: "codigo_instrucao_movimento", ruleId: "G061", start: 16, end: 17, type: "N", label: "Código Instrução p/ Movimento" },
      { name: "codigo_barras", ruleId: "N001", start: 18, end: 61, type: "A", label: "Código de Barras" },
      { name: "nome_concessionaria", ruleId: "G013", start: 62, end: 91, type: "A", label: "Nome da Concessionária/Órgão" },
      { name: "data_vencimento", ruleId: "G044", start: 92, end: 99, type: "N", label: "Data do Vencimento" },
      { name: "data_pagamento", ruleId: "P009", start: 100, end: 107, type: "N", label: "Data do Pagamento" },
      { name: "valor_pagamento", ruleId: "P004", start: 108, end: 122, type: "N", label: "Valor do Pagamento" },
      { name: "seu_numero", ruleId: "G064", start: 123, end: 142, type: "A", label: "Nº do Docum. Atribuído p/ Empresa" },
      { name: "nosso_numero", ruleId: "G043", start: 143, end: 162, type: "A", label: "Nº do Docum. Atribuído pelo Banco" },
      { name: "uso_exclusivo_febraban_1", ruleId: "G004", start: 163, end: 230, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "ocorrencias", ruleId: "G059", start: 231, end: 240, type: "A", label: "Códigos das Ocorrências p/ Retorno" }
    ]
  }
};
