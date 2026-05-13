export const CNAB_SEGMENTO_B_SUB_TYPES = {
  // Layout Padrão: Endereço e Vencimento
  standard: [
    { name: "logradouro", ruleId: "G101", start: 33, end: 67, type: "A", label: "Logradouro (Rua, Av, etc)" },
    { name: "numero_local", ruleId: "G101", start: 68, end: 72, type: "N", label: "Número" },
    { name: "complemento", ruleId: "G101", start: 73, end: 87, type: "A", label: "Complemento" },
    { name: "bairro", ruleId: "G101", start: 88, end: 102, type: "A", label: "Bairro" },
    { name: "cidade", ruleId: "G101", start: 103, end: 117, type: "A", label: "Cidade" },
    { name: "cep", ruleId: "G101", start: 118, end: 122, type: "N", label: "CEP" },
    { name: "cep_complemento", ruleId: "G101", start: 123, end: 125, type: "A", label: "Complemento CEP" },
    { name: "estado", ruleId: "G036", start: 126, end: 127, type: "A", label: "Estado (UF)" },
    { name: "data_vencimento", ruleId: "G044", start: 128, end: 135, type: "N", label: "Data do Vencimento (Nominal)" },
    { name: "valor_documento", ruleId: "G042", start: 136, end: 150, type: "N", label: "Valor do Documento (Nominal)" },
    { name: "valor_abatimento", ruleId: "L002", start: 151, end: 165, type: "N", label: "Valor do Abatimento" },
    { name: "valor_desconto", ruleId: "L002", start: 166, end: 180, type: "N", label: "Valor do Desconto" },
    { name: "valor_mora", ruleId: "L003", start: 181, end: 195, type: "N", label: "Valor da Mora" },
    { name: "valor_multa", ruleId: "L003", start: 196, end: 210, type: "N", label: "Valor da Multa" },
    { name: "codigo_documento_favorecido", ruleId: "G064", start: 211, end: 225, type: "A", label: "Cód./Docum. do Favorecido" },
    { name: "aviso_favorecido", ruleId: "P006", start: 226, end: 226, type: "N", label: "Aviso ao Favorecido" }
  ],
  // Layout PIX: TXID e Chaves
  pix: [
    { name: "txid", ruleId: "G102", start: 33, end: 67, type: "A", label: "TX ID (Opcional)" },
    { name: "uso_exclusivo_febraban_pix", ruleId: "G004", start: 68, end: 127, type: "A", label: "Uso Exclusivo FEBRABAN", default: " " },
    { name: "chave_pix", ruleId: "G102", start: 128, end: 226, type: "A", label: "Identificação/Chave Pix" }
  ]
};

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
      // O campo 18-19 pode ser G100 (PIX) ou Tipo Inscrição (Standard)
      // No schema base, vamos deixar como 'identificador_b' e a lógica dinâmica resolve
      { name: "identificacao_entrada", ruleId: "G100", start: 18, end: 19, type: "N", label: "Identificador (Tipo Inscrição ou Iniciação Pix)" },
      { name: "numero_inscricao_favorecido", ruleId: "G006", start: 20, end: 32, type: "N", label: "Nº de Inscrição do Favorecido" },
      // Os campos abaixo serão substituídos dinamicamente pelo engine.js
      { name: "informacoes_complementares_b", ruleId: "G101", start: 33, end: 226, type: "A", label: "Informações Complementares G101" },
      { name: "codigo_ug_centralizadora", ruleId: "P012", start: 227, end: 232, type: "N", label: "Código UG Centralizadora (SIAPE)" },
      { name: "codigo_ispb", ruleId: "P015", start: 233, end: 240, type: "N", label: "Código ISPB (Banco Destino)" }
    ]
  }
};
