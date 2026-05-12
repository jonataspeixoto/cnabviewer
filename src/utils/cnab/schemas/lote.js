export const CNAB_SCHEMAS_LOTE = {
  // 3. HEADER DE LOTE - Registro Tipo 1 (Manual Pág. 24)
  header_lote_pagamento: {
    id: "header_lote_pagamento",
    label: "Header de Lote (Pagamentos)",
    fields: [
      { name: "codigo_banco", ruleId: "G001", start: 1, end: 3, type: "N", label: "Código do Banco" },
      { name: "lote_servico", ruleId: "G002", start: 4, end: 7, type: "N", label: "Lote de Serviço" },
      { name: "tipo_registro", ruleId: "G003", start: 8, end: 8, type: "N", label: "Tipo de Registro", default: "1" },
      { name: "tipo_operacao", ruleId: "G028", start: 9, end: 9, type: "A", label: "Tipo da Operação", default: "C" },
      { name: "tipo_servico", ruleId: "G025", start: 10, end: 11, type: "N", label: "Tipo do Serviço" },
      { name: "forma_lancamento", ruleId: "G029", start: 12, end: 13, type: "N", label: "Forma de Lançamento" },
      { name: "versao_layout_lote", ruleId: "G030", start: 14, end: 16, type: "N", label: "Nº da Versão do Layout do Lote", default: "046" },
      { name: "uso_exclusivo_febraban_1", ruleId: "G004", start: 17, end: 17, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "empresa_inscricao_tipo", ruleId: "G005", start: 18, end: 18, type: "N", label: "Tipo de Inscrição da Empresa" },
      { name: "empresa_inscricao_numero", ruleId: "G006", start: 19, end: 32, type: "N", label: "Número de Inscrição da Empresa" },
      { name: "codigo_convenio", ruleId: "G007", start: 33, end: 52, type: "A", label: "Código do Convênio no Banco" },
      { name: "agencia_mantenedora", ruleId: "G008", start: 53, end: 57, type: "N", label: "Agência Mantenedora da Conta" },
      { name: "agencia_dv", ruleId: "G009", start: 58, end: 58, type: "A", label: "Dígito Verificador da Agência" },
      { name: "numero_conta", ruleId: "G010", start: 59, end: 70, type: "N", label: "Número da Conta Corrente" },
      { name: "conta_dv", ruleId: "G011", start: 71, end: 71, type: "A", label: "Dígito Verificador da Conta" },
      { name: "agencia_conta_dv", ruleId: "G012", start: 72, end: 72, type: "A", label: "Dígito Verificador da Ag/Conta" },
      { name: "nome_empresa", ruleId: "G013", start: 73, end: 102, type: "A", label: "Nome da Empresa" },
      { name: "informacao_1", ruleId: "G031", start: 103, end: 142, type: "A", label: "Mensagem 1" },
      { name: "logradouro", ruleId: "G032", start: 143, end: 172, type: "A", label: "Logradouro (Rua, Av, etc)" },
      { name: "numero_local", ruleId: "G032", start: 173, end: 177, type: "N", label: "Número (Local)" },
      { name: "complemento", ruleId: "G032", start: 178, end: 192, type: "A", label: "Complemento (Casa, Apto, etc)" },
      { name: "cidade", ruleId: "G033", start: 193, end: 212, type: "A", label: "Nome da Cidade" },
      { name: "cep", ruleId: "G034", start: 213, end: 217, type: "N", label: "CEP" },
      { name: "cep_complemento", ruleId: "G035", start: 218, end: 220, type: "A", label: "Complemento do CEP" },
      { name: "estado", ruleId: "G036", start: 221, end: 222, type: "A", label: "Sigla do Estado" },
      { name: "indicativo_forma_pagamento", ruleId: "P014", start: 223, end: 224, type: "N", label: "Indicativo de Forma de Pagamento" },
      { name: "uso_exclusivo_febraban_2", ruleId: "G004", start: 225, end: 230, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "ocorrencias", ruleId: "G059", start: 231, end: 240, type: "A", label: "Códigos das Ocorrências p/ Retorno" }
    ]
  },

  // 4. TRAILER DE LOTE - Registro Tipo 5 (Manual Pág. 28)
  trailer_lote_pagamento: {
    id: "trailer_lote_pagamento",
    label: "Trailer de Lote (Pagamentos)",
    fields: [
      { name: "codigo_banco", ruleId: "G001", start: 1, end: 3, type: "N", label: "Código do Banco" },
      { name: "lote_servico", ruleId: "G002", start: 4, end: 7, type: "N", label: "Lote de Serviço" },
      { name: "tipo_registro", ruleId: "G003", start: 8, end: 8, type: "N", label: "Tipo de Registro", default: "5" },
      { name: "uso_exclusivo_febraban_1", ruleId: "G004", start: 9, end: 17, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "quantidade_registros", ruleId: "G057", start: 18, end: 23, type: "N", label: "Quantidade de Registros do Lote" },
      { name: "somatoria_valores", ruleId: "P007", start: 24, end: 41, type: "N", label: "Somatória dos Valores" },
      { name: "somatoria_moedas", ruleId: "G058", start: 42, end: 59, type: "N", label: "Somatória de Quantidade de Moedas" },
      { name: "numero_aviso_debito", ruleId: "G066", start: 60, end: 65, type: "N", label: "Número Aviso de Débito" },
      { name: "uso_exclusivo_febraban_2", ruleId: "G004", start: 66, end: 230, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "ocorrencias", ruleId: "G059", start: 231, end: 240, type: "A", label: "Códigos das Ocorrências para Retorno" }
    ]
  }
};
