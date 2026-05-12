export const CNAB_SCHEMAS_ARQUIVO = {
  // 1. HEADER DE ARQUIVO - Registro Tipo 0 (Manual Pág. 17)
  header_arquivo: {
    id: "header_arquivo",
    label: "Header de Arquivo",
    fields: [
      { name: "codigo_banco", ruleId: "G001", start: 1, end: 3, type: "N", label: "Código do Banco" },
      { name: "lote_servico", ruleId: "G002", start: 4, end: 7, type: "N", label: "Lote de Serviço", default: "0000" },
      { name: "tipo_registro", ruleId: "G003", start: 8, end: 8, type: "N", label: "Tipo de Registro", default: "0" },
      { name: "uso_exclusivo_febraban_1", ruleId: "G004", start: 9, end: 17, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "empresa_inscricao_tipo", ruleId: "G005", start: 18, end: 18, type: "N", label: "Tipo de Inscrição da Empresa" },
      { name: "empresa_inscricao_numero", ruleId: "G006", start: 19, end: 32, type: "N", label: "Número de Inscrição da Empresa" },
      { name: "codigo_convenio", ruleId: "G007", start: 33, end: 52, type: "A", label: "Código do Convênio no Banco" },
      { name: "agencia_mantenedora", ruleId: "G008", start: 53, end: 57, type: "N", label: "Agência Mantenedora da Conta" },
      { name: "agencia_dv", ruleId: "G009", start: 58, end: 58, type: "A", label: "Dígito Verificador da Agência" },
      { name: "numero_conta", ruleId: "G010", start: 59, end: 70, type: "N", label: "Número da Conta Corrente" },
      { name: "conta_dv", ruleId: "G011", start: 71, end: 71, type: "A", label: "Dígito Verificador da Conta" },
      { name: "agencia_conta_dv", ruleId: "G012", start: 72, end: 72, type: "A", label: "Dígito Verificador da Ag/Conta" },
      { name: "nome_empresa", ruleId: "G013", start: 73, end: 102, type: "A", label: "Nome da Empresa" },
      { name: "nome_banco", ruleId: "G014", start: 103, end: 132, type: "A", label: "Nome do Banco" },
      { name: "uso_exclusivo_febraban_2", ruleId: "G004", start: 133, end: 142, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "codigo_remessa_retorno", ruleId: "G015", start: 143, end: 143, type: "N", label: "Código Remessa / Retorno" },
      { name: "data_geracao", ruleId: "G016", start: 144, end: 151, type: "N", label: "Data de Geração do Arquivo" },
      { name: "hora_geracao", ruleId: "G017", start: 152, end: 157, type: "N", label: "Hora de Geração do Arquivo" },
      { name: "sequencial_nsa", ruleId: "G018", start: 158, end: 163, type: "N", label: "Número Seqüencial do Arquivo" },
      { name: "versao_layout", ruleId: "G019", start: 164, end: 166, type: "N", label: "Nº da Versão do Layout do Arquivo", default: "103" },
      { name: "densidade_gravacao", ruleId: "G020", start: 167, end: 171, type: "N", label: "Densidade de Gravação do Arquivo" },
      { name: "reservado_banco", ruleId: "G021", start: 172, end: 191, type: "A", label: "Para Uso Reservado do Banco" },
      { name: "reservado_empresa", ruleId: "G022", start: 192, end: 211, type: "A", label: "Para Uso Reservado da Empresa" },
      { name: "uso_exclusivo_febraban_3", ruleId: "G004", start: 212, end: 240, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " }
    ]
  },

  // 2. TRAILER DE ARQUIVO - Registro Tipo 9 (Manual Pág. 18)
  trailer_arquivo: {
    id: "trailer_arquivo",
    label: "Trailer de Arquivo",
    fields: [
      { name: "codigo_banco", ruleId: "G001", start: 1, end: 3, type: "N", label: "Código do Banco" },
      { name: "lote_servico", ruleId: "G002", start: 4, end: 7, type: "N", label: "Lote de Serviço", default: "9999" },
      { name: "tipo_registro", ruleId: "G003", start: 8, end: 8, type: "N", label: "Tipo de Registro", default: "9" },
      { name: "uso_exclusivo_febraban_1", ruleId: "G004", start: 9, end: 17, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "quantidade_lotes", ruleId: "G049", start: 18, end: 23, type: "N", label: "Quantidade de Lotes do Arquivo" },
      { name: "quantidade_registros", ruleId: "G056", start: 24, end: 29, type: "N", label: "Quantidade de Registros do Arquivo" },
      { name: "quantidade_contas_concil", ruleId: "G037", start: 30, end: 35, type: "N", label: "Qtde de Contas p/ Conc. (Lotes)" },
      { name: "uso_exclusivo_febraban_2", ruleId: "G004", start: 36, end: 240, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " }
    ]
  }
};
