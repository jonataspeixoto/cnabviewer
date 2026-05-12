export const CNAB_SCHEMA_SEGMENTO_R = {
  segmento_r: {
    id: "segmento_r",
    label: "Segmento R - Descontos/Multas",
    segmento_id: "R",
    fields: [
      { name: "codigo_banco", start: 1, end: 3, type: "N", label: "Banco", ruleId: "G001" },
      { name: "lote_servico", start: 4, end: 7, type: "N", label: "Lote", ruleId: "G002" },
      { name: "tipo_registro", start: 8, end: 8, type: "N", label: "Registro", default: "3", ruleId: "G003" },
      { name: "numero_sequencial", start: 9, end: 13, type: "N", label: "Sequencial", ruleId: "G038" },
      { name: "codigo_segmento", start: 14, end: 14, type: "A", label: "Segmento", default: "R", ruleId: "G039" },
      { name: "uso_exclusivo_febraban_1", start: 15, end: 15, type: "A", label: "Reservado", ruleId: "G004" },
      { name: "codigo_movimento", start: 16, end: 17, type: "N", label: "Movimento", ruleId: "C004" },
      { name: "desconto_2_codigo", start: 18, end: 18, type: "N", label: "Cód. Desc. 2", ruleId: "C021" },
      { name: "desconto_2_data", start: 19, end: 26, type: "N", label: "Data Desc. 2" },
      { name: "desconto_2_valor", start: 27, end: 41, type: "N", label: "Valor/Percentual Desc. 2" },
      { name: "desconto_3_codigo", start: 42, end: 42, type: "N", label: "Cód. Desc. 3", ruleId: "C021" },
      { name: "desconto_3_data", start: 43, end: 50, type: "N", label: "Data Desc. 3" },
      { name: "desconto_3_valor", start: 51, end: 65, type: "N", label: "Valor/Percentual Desc. 3" },
      { name: "multa_codigo", start: 66, end: 66, type: "A", label: "Cód. Multa", ruleId: "C018" },
      { name: "multa_data", start: 67, end: 74, type: "N", label: "Data Multa" },
      { name: "multa_valor", start: 75, end: 89, type: "N", label: "Valor/Percentual Multa" },
      { name: "informacao_ao_sacado", start: 90, end: 129, type: "A", label: "Informação ao Sacado" },
      { name: "mensagem_3", start: 130, end: 169, type: "A", label: "Mensagem 3" },
      { name: "mensagem_4", start: 170, end: 209, type: "A", label: "Mensagem 4" },
      { name: "uso_exclusivo_febraban_2", start: 210, end: 230, type: "A", label: "Reservado", ruleId: "G004" },
      { name: "ocorrencias", start: 231, end: 240, type: "A", label: "Ocorrências", ruleId: "G059" }
    ]
  }
};
