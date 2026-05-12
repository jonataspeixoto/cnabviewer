export const CNAB_SCHEMA_SEGMENTO_J = {
  // 7. SEGMENTO J - Pagamento de Títulos de Cobrança (Manual Pág. 30)
  segmento_j: {
    id: "segmento_j",
    label: "Segmento J - Dados do Boleto",
    fields: [
      { name: "codigo_banco", ruleId: "G001", start: 1, end: 3, type: "N", label: "Código do Banco" },
      { name: "lote_servico", ruleId: "G002", start: 4, end: 7, type: "N", label: "Lote de Serviço" },
      { name: "tipo_registro", ruleId: "G003", start: 8, end: 8, type: "N", label: "Tipo de Registro", default: "3" },
      { name: "numero_sequencial", ruleId: "G038", start: 9, end: 13, type: "N", label: "Nº Sequencial no Lote" },
      { name: "codigo_segmento", ruleId: "G039", start: 14, end: 14, type: "A", label: "Código Segmento", default: "J" },
      { name: "tipo_movimento", ruleId: "G060", start: 15, end: 15, type: "N", label: "Tipo de Movimento" },
      { name: "codigo_instrucao_movimento", ruleId: "G061", start: 16, end: 17, type: "N", label: "Código Instrução p/ Movimento" },
      { name: "codigo_barras", ruleId: "G063", start: 18, end: 61, type: "N", label: "Código de Barras" },
      { name: "nome_beneficiario", ruleId: "G013", start: 62, end: 91, type: "A", label: "Nome do Beneficiário" },
      { name: "data_vencimento", ruleId: "G044", start: 92, end: 99, type: "N", label: "Data do Vencimento (Nominal)" },
      { name: "valor_titulo", ruleId: "G042", start: 100, end: 114, type: "N", label: "Valor do Título (Nominal)" },
      { name: "valor_desconto_abatimento", ruleId: "L002", start: 115, end: 129, type: "N", label: "Valor do Desconto + Abatimento" },
      { name: "valor_mora_multa", ruleId: "L003", start: 130, end: 144, type: "N", label: "Valor da Mora + Multa" },
      { name: "data_pagamento", ruleId: "P009", start: 145, end: 152, type: "N", label: "Data do Pagamento" },
      { name: "valor_pagamento", ruleId: "P010", start: 153, end: 167, type: "N", label: "Valor do Pagamento" },
      { name: "quantidade_moeda", ruleId: "G041", start: 168, end: 182, type: "N", label: "Quantidade da Moeda" },
      { name: "referencia_pagador", ruleId: "G064", start: 183, end: 202, type: "A", label: "Nº do Docum. Atribuído p/ Empresa" },
      { name: "nosso_numero", ruleId: "G043", start: 203, end: 222, type: "A", label: "Nº do Docum. Atribuído pelo Banco" },
      { name: "codigo_moeda", ruleId: "G065", start: 223, end: 224, type: "N", label: "Código da Moeda" },
      { name: "uso_exclusivo_febraban_1", ruleId: "G004", start: 225, end: 230, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "ocorrencias", ruleId: "G059", start: 231, end: 240, type: "A", label: "Códigos das Ocorrências p/ Retorno" }
    ]
  },

  // 8. SEGMENTO J-52 - Identificação de Beneficiário/Pagador (Manual Pág. 31)
  segmento_j52: {
    id: "segmento_j52",
    label: "Segmento J-52 - Extensão de Identificação",
    fields: [
      { name: "codigo_banco", ruleId: "G001", start: 1, end: 3, type: "N", label: "Código do Banco" },
      { name: "lote_servico", ruleId: "G002", start: 4, end: 7, type: "N", label: "Lote de Serviço" },
      { name: "tipo_registro", ruleId: "G003", start: 8, end: 8, type: "N", label: "Tipo de Registro", default: "3" },
      { name: "numero_sequencial", ruleId: "G038", start: 9, end: 13, type: "N", label: "Nº Sequencial no Lote" },
      { name: "codigo_segmento", ruleId: "G039", start: 14, end: 14, type: "A", label: "Código Segmento", default: "J" },
      { name: "uso_exclusivo_febraban_1", ruleId: "G004", start: 15, end: 15, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "codigo_movimento", ruleId: "C004", start: 16, end: 17, type: "N", label: "Código de Movimento" },
      { name: "identificacao_registro_opcional", ruleId: "G067", start: 18, end: 19, type: "N", label: "Cód. Registro Opcional", default: "52" },
      { name: "pagador_tipo_inscricao", ruleId: "G005", start: 20, end: 20, type: "N", label: "Tipo de Inscrição do Pagador" },
      { name: "pagador_numero_inscricao", ruleId: "G006", start: 21, end: 35, type: "N", label: "Nº de Inscrição do Pagador" },
      { name: "pagador_nome", ruleId: "G013", start: 36, end: 75, type: "A", label: "Nome do Pagador" },
      { name: "beneficiario_tipo_inscricao", ruleId: "G005", start: 76, end: 76, type: "N", label: "Tipo de Inscrição do Beneficiário" },
      { name: "beneficiario_numero_inscricao", ruleId: "G006", start: 77, end: 91, type: "N", label: "Nº de Inscrição do Beneficiário" },
      { name: "beneficiario_nome", ruleId: "G013", start: 92, end: 131, type: "A", label: "Nome do Beneficiário" },
      { name: "sacador_tipo_inscricao", ruleId: "G005", start: 132, end: 132, type: "N", label: "Tipo de Inscrição do Sacador/Avalista" },
      { name: "sacador_numero_inscricao", ruleId: "G006", start: 133, end: 147, type: "N", label: "Nº de Inscrição do Sacador/Avalista" },
      { name: "sacador_nome", ruleId: "G013", start: 148, end: 187, type: "A", label: "Nome do Sacador/Avalista" },
      { name: "uso_exclusivo_febraban_2", ruleId: "G004", start: 188, end: 240, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " }
    ]
  }
};

/**
 * SUB-SCHEMAS DINÂMICOS PARA O SEGMENTO J-52 (Posições 20 a 240)
 * Estratégia: Quando o App detectar Segmento J com Posição 18-19 == "52", 
 * deve verificar a "Forma de Lançamento" (G029) no Header do Lote para aplicar o sub-layout.
 */
export const CNAB_SEGMENTO_J52_SUB_TYPES = {
  // J-52 PIX: QR Code Pix (Manual Pág. 32)
  // Ativado se G029 == 45 ou 47
  pix: [
    { name: "devedor_tipo_inscricao", ruleId: "G005", start: 20, end: 20, type: "N", label: "Tipo Inscrição Devedor" },
    { name: "devedor_numero_inscricao", ruleId: "G006", start: 21, end: 35, type: "N", label: "Nº Inscrição Devedor" },
    { name: "devedor_nome", ruleId: "G013", start: 36, end: 75, type: "A", label: "Nome do Devedor" },
    { name: "favorecido_tipo_inscricao", ruleId: "G005", start: 76, end: 76, type: "N", label: "Tipo Inscrição Favorecido" },
    { name: "favorecido_numero_inscricao", ruleId: "G006", start: 77, end: 91, type: "N", label: "Nº Inscrição Favorecido" },
    { name: "favorecido_nome", ruleId: "G013", start: 92, end: 131, type: "A", label: "Nome do Favorecido" },
    { name: "chave_pagamento", ruleId: "G102", start: 132, end: 210, type: "A", label: "URL/Chave de Endereçamento" },
    { name: "txid", ruleId: "G102", start: 211, end: 240, type: "A", label: "TXID - Identificador da Transação" }
  ]
};
