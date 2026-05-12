export const CNAB_SCHEMA_SEGMENTO_Q = {
  segmento_q: {
    id: "segmento_q",
    label: "Segmento Q - Pagador",
    segmento_id: "Q",
    fields: [
      { name: "codigo_banco", start: 1, end: 3, type: "N", label: "Banco", ruleId: "G001" },
      { name: "lote_servico", start: 4, end: 7, type: "N", label: "Lote", ruleId: "G002" },
      { name: "tipo_registro", start: 8, end: 8, type: "N", label: "Registro", default: "3", ruleId: "G003" },
      { name: "numero_sequencial", start: 9, end: 13, type: "N", label: "Sequencial", ruleId: "G038" },
      { name: "codigo_segmento", start: 14, end: 14, type: "A", label: "Segmento", default: "Q", ruleId: "G039" },
      { name: "uso_exclusivo_febraban_1", start: 15, end: 15, type: "A", label: "Reservado", ruleId: "G004" },
      { name: "codigo_movimento", start: 16, end: 17, type: "N", label: "Movimento", ruleId: "C004" },
      { name: "pagador_tipo_inscricao", start: 18, end: 18, type: "N", label: "Tipo Inscrição", ruleId: "G005" },
      { name: "pagador_numero_inscricao", start: 19, end: 33, type: "N", label: "Inscrição Número", ruleId: "G006" },
      { name: "pagador_nome", start: 34, end: 73, type: "A", label: "Nome Pagador", ruleId: "G013" },
      { name: "pagador_endereco", start: 74, end: 113, type: "A", label: "Endereço" },
      { name: "pagador_bairro", start: 114, end: 128, type: "A", label: "Bairro" },
      { name: "pagador_cep", start: 129, end: 133, type: "N", label: "CEP" },
      { name: "pagador_cep_sufixo", start: 134, end: 136, type: "N", label: "Sufixo CEP" },
      { name: "pagador_cidade", start: 137, end: 151, type: "A", label: "Cidade" },
      { name: "pagador_uf", start: 152, end: 153, type: "A", label: "UF", ruleId: "G036" },
      { name: "avalista_tipo_inscricao", start: 154, end: 154, type: "N", label: "Sacador/Avalista Tipo", ruleId: "G005" },
      { name: "avalista_numero_inscricao", start: 155, end: 169, type: "N", label: "Sacador/Avalista Número", ruleId: "G006" },
      { name: "avalista_nome", start: 170, end: 209, type: "A", label: "Sacador/Avalista Nome" },
      { name: "banco_correspondente", start: 210, end: 212, type: "N", label: "Cód. Banco Corresp." },
      { name: "nosso_numero_correspondente", start: 213, end: 232, type: "A", label: "Nosso Nº Corresp." },
      { name: "uso_exclusivo_febraban_2", start: 233, end: 240, type: "A", label: "Reservado", ruleId: "G004" }
    ]
  }
};
