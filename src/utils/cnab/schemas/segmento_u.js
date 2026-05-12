export const CNAB_SCHEMA_SEGMENTO_U = {
  // 15. SEGMENTO U - Dados de Pagamento e Ocorrências (Manual Pág. 68)
  segmento_u: {
    id: "segmento_u",
    label: "Segmento U - Retorno (Dados Financeiros)",
    fields: [
      { name: "codigo_banco", ruleId: "G001", start: 1, end: 3, type: "N", label: "Código do Banco" },
      { name: "lote_servico", ruleId: "G002", start: 4, end: 7, type: "N", label: "Lote de Serviço" },
      { name: "tipo_registro", ruleId: "G003", start: 8, end: 8, type: "N", label: "Tipo de Registro", default: "3" },
      { name: "numero_sequencial", ruleId: "G038", start: 9, end: 13, type: "N", label: "Nº Sequencial no Lote" },
      { name: "codigo_segmento", ruleId: "G039", start: 14, end: 14, type: "A", label: "Código Segmento", default: "U" },
      { name: "uso_exclusivo_febraban_1", ruleId: "G004", start: 15, end: 15, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "codigo_movimento", ruleId: "C044", start: 16, end: 17, type: "N", label: "Código Movimento Retorno" },
      { name: "juros_multa_encargos", ruleId: "C048", start: 18, end: 32, type: "N", label: "Juros / Multa / Encargos" },
      { name: "valor_desconto", ruleId: "C049", start: 33, end: 47, type: "N", label: "Valor do Desconto Concedido" },
      { name: "valor_abatimento", ruleId: "C050", start: 48, end: 62, type: "N", label: "Valor do Abatimento Conc/Canc" },
      { name: "valor_iof", ruleId: "G077", start: 63, end: 77, type: "N", label: "Valor do IOF Recolhido" },
      { name: "valor_pago", ruleId: "C052", start: 78, end: 92, type: "N", label: "Valor Pago pelo Pagador" },
      { name: "valor_liquido", ruleId: "G078", start: 93, end: 107, type: "N", label: "Valor Líquido a ser Creditado" },
      { name: "outras_despesas", ruleId: "C054", start: 108, end: 122, type: "N", label: "Valor de Outras Despesas" },
      { name: "outros_creditos", ruleId: "C055", start: 123, end: 137, type: "N", label: "Valor de Outros Créditos" },
      { name: "data_ocorrencia", ruleId: "C056", start: 138, end: 145, type: "N", label: "Data da Ocorrência" },
      { name: "data_credito", ruleId: "C057", start: 146, end: 153, type: "N", label: "Data do Crédito" },
      { name: "cod_ocor_pagador", ruleId: "C058", start: 154, end: 157, type: "A", label: "Cód. Ocorrência do Pagador" },
      { name: "data_ocor_pagador", ruleId: "C058", start: 158, end: 165, type: "N", label: "Data Ocorrência Pagador" },
      { name: "valor_ocor_pagador", ruleId: "C059", start: 166, end: 180, type: "N", label: "Valor Ocorrência Pagador" },
      { name: "compl_ocor_pagador", ruleId: "G031", start: 181, end: 210, type: "A", label: "Compl. Ocorrência Pagador" },
      { name: "codigo_banco_corresp", ruleId: "C031", start: 211, end: 213, type: "N", label: "Cód. Banco Corresp. Compens." },
      { name: "nosso_numero_corresp", ruleId: "C032", start: 214, end: 233, type: "N", label: "Nosso Número Banco Corresp." },
      { name: "uso_exclusivo_febraban_2", ruleId: "G004", start: 234, end: 240, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " }
    ]
  }
};
