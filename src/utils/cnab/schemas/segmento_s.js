export const CNAB_SCHEMA_SEGMENTO_S = {
  // 13. SEGMENTO S - Impressão de Mensagens (Manual Pág. 58)
  segmento_s: {
    id: "segmento_s",
    label: "Segmento S - Mensagens de Impressão",
    fields: [
      { name: "codigo_banco", ruleId: "G001", start: 1, end: 3, type: "N", label: "Código do Banco" },
      { name: "lote_servico", ruleId: "G002", start: 4, end: 7, type: "N", label: "Lote de Serviço" },
      { name: "tipo_registro", ruleId: "G003", start: 8, end: 8, type: "N", label: "Tipo de Registro", default: "3" },
      { name: "numero_sequencial", ruleId: "G038", start: 9, end: 13, type: "N", label: "Nº Sequencial no Lote" },
      { name: "codigo_segmento", ruleId: "G039", start: 14, end: 14, type: "A", label: "Código Segmento", default: "S" },
      { name: "uso_exclusivo_febraban_1", ruleId: "G004", start: 15, end: 15, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "codigo_movimento", ruleId: "C004", start: 16, end: 17, type: "N", label: "Código de Movimento" },
      { name: "tipo_impressao", ruleId: "C040", start: 18, end: 18, type: "N", label: "Tipo de Impressão" },
      { name: "numero_linha", ruleId: "C041", start: 19, end: 20, type: "N", label: "Número da Linha a ser Impressa" },
      { name: "mensagem_impressa", ruleId: "C042", start: 21, end: 160, type: "A", label: "Mensagem a ser Impressa" },
      { name: "tipo_fonte", ruleId: "C043", start: 161, end: 162, type: "N", label: "Tipo de Fonte" },
      { name: "uso_exclusivo_febraban_2", ruleId: "G004", start: 163, end: 240, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " }
    ]
  }
};
