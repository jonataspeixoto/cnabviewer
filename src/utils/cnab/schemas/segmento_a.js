export const CNAB_SCHEMA_SEGMENTO_A = {
  segmento_a: {
    id: "segmento_a",
    label: "Segmento A - Dados do Pagamento",
    fields: [
      { name: "codigo_banco", ruleId: "G001", start: 1, end: 3, type: "N", label: "Código do Banco" },
      { name: "lote_servico", ruleId: "G002", start: 4, end: 7, type: "N", label: "Lote de Serviço" },
      { name: "tipo_registro", ruleId: "G003", start: 8, end: 8, type: "N", label: "Tipo de Registro", default: "3" },
      { name: "numero_sequencial", ruleId: "G038", start: 9, end: 13, type: "N", label: "Nº Sequencial no Lote" },
      { name: "codigo_segmento", ruleId: "G039", start: 14, end: 14, type: "A", label: "Código Segmento", default: "A" },
      { name: "tipo_movimento", ruleId: "G060", start: 15, end: 15, type: "N", label: "Tipo de Movimento" },
      { name: "codigo_instrucao_movimento", ruleId: "G061", start: 16, end: 17, type: "N", label: "Código Instrução p/ Movimento" },
      { name: "codigo_camara", ruleId: "P001", start: 18, end: 20, type: "N", label: "Código da Câmara Centralizadora" },
      { name: "codigo_banco_favorecido", ruleId: "P002", start: 21, end: 23, type: "N", label: "Código do Banco do Favorecido" },
      { name: "agencia_mantenedora", ruleId: "G008", start: 24, end: 28, type: "N", label: "Agência Mantenedora da Conta" },
      { name: "agencia_dv", ruleId: "G009", start: 29, end: 29, type: "A", label: "Dígito Verificador da Agência" },
      { name: "numero_conta", ruleId: "G010", start: 30, end: 41, type: "N", label: "Número da Conta Corrente" },
      { name: "conta_dv", ruleId: "G011", start: 42, end: 42, type: "A", label: "Dígito Verificador da Conta" },
      { name: "agencia_conta_dv", ruleId: "G012", start: 43, end: 43, type: "A", label: "Dígito Verificador da AG/Conta" },
      { name: "nome_favorecido", ruleId: "G013", start: 44, end: 73, type: "A", label: "Nome do Favorecido" },
      { name: "seu_numero", ruleId: "G064", start: 74, end: 93, type: "A", label: "Nº do Docum. Atribuído p/ Empresa" },
      { name: "data_pagamento", ruleId: "P009", start: 94, end: 101, type: "N", label: "Data do Pagamento" },
      { name: "tipo_moeda", ruleId: "G040", start: 102, end: 104, type: "A", label: "Tipo da Moeda" },
      { name: "quantidade_moeda", ruleId: "G041", start: 105, end: 119, type: "N", label: "Quantidade da Moeda" },
      { name: "valor_pagamento", ruleId: "P010", start: 120, end: 134, type: "N", label: "Valor do Pagamento" },
      { name: "nosso_numero", ruleId: "G043", start: 135, end: 154, type: "A", label: "Nº do Docum. Atribuído pelo Banco" },
      { name: "data_real_pagamento", ruleId: "P003", start: 155, end: 162, type: "N", label: "Data Real da Efetivação Pagto" },
      { name: "valor_real_pagamento", ruleId: "P004", start: 163, end: 177, type: "N", label: "Valor Real da Efetivação do Pagto" },
      { name: "informacao_2", ruleId: "G031", start: 178, end: 217, type: "A", label: "Outras Informações (Mensagens/Pix)" },
      { name: "codigo_finalidade_doc", ruleId: "P005", start: 218, end: 219, type: "A", label: "Código Finalidade Doc" },
      { name: "codigo_finalidade_ted", ruleId: "P011", start: 220, end: 224, type: "A", label: "Código Finalidade TED" },
      { name: "codigo_finalidade_complementar", ruleId: "P013", start: 225, end: 226, type: "A", label: "Complemento de Finalidade Pagto" },
      { name: "uso_exclusivo_febraban_1", ruleId: "G004", start: 227, end: 229, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "aviso_favorecido", ruleId: "P006", start: 230, end: 230, type: "N", label: "Aviso ao Favorecido" },
      { name: "ocorrencias", ruleId: "G059", start: 231, end: 240, type: "A", label: "Códigos das Ocorrências p/ Retorno" }
    ]
  }
};
