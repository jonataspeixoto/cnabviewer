export const CNAB_SCHEMA_SEGMENTO_B = {
  segmento_b: {
    id: "segmento_b",
    label: "Segmento B - Complemento e Pix",
    fields: [
      { name: "codigo_banco", ruleId: "G001", start: 1, end: 3, type: "N", label: "Código do Banco" },
      { name: "lote_servico", ruleId: "G002", start: 4, end: 7, type: "N", label: "Lote de Serviço" },
      { name: "tipo_registro", ruleId: "G003", start: 8, end: 8, type: "N", label: "Tipo de Registro", default: "3" },
      { name: "numero_sequencial", ruleId: "G038", start: 9, end: 13, type: "N", label: "Nº Sequencial no Lote" },
      { name: "codigo_segmento", ruleId: "G039", start: 14, end: 14, type: "A", label: "Código Segmento", default: "B" },
      { name: "uso_exclusivo_febraban_1", ruleId: "G004", start: 15, end: 17, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "tipo_inscricao_favorecido", ruleId: "G005", start: 18, end: 18, type: "N", label: "Tipo de Inscrição do Favorecido" },
      { name: "numero_inscricao_favorecido", ruleId: "G006", start: 19, end: 32, type: "N", label: "Nº de Inscrição do Favorecido" },
      { name: "informacao_10", ruleId: "G101", start: 33, end: 67, type: "A", label: "Informação 10 (Dados Adicionais)" },
      { name: "informacao_11", ruleId: "G101", start: 68, end: 127, type: "A", label: "Informação 11 (Dados Adicionais)" },
      { name: "informacao_12", ruleId: "G101", start: 128, end: 226, type: "A", label: "Informação 12 (Chave Pix)" },
      { name: "codigo_ug_centralizadora", ruleId: "P012", start: 227, end: 232, type: "N", label: "Código UG Centralizadora (SIAPE)" },
      { name: "codigo_ispb", ruleId: "P015", start: 233, end: 240, type: "N", label: "Código ISPB (Banco Destino)" }
    ]
  }
};
