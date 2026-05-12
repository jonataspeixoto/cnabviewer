export const CNAB_SCHEMA_SEGMENTO_T = {
  // 14. SEGMENTO T - Confirmação de Entrada/Liquidação (Manual Pág. 67)
  segmento_t: {
    id: "segmento_t",
    label: "Segmento T - Retorno (Dados do Título)",
    fields: [
      { name: "codigo_banco", ruleId: "G001", start: 1, end: 3, type: "N", label: "Código do Banco" },
      { name: "lote_servico", ruleId: "G002", start: 4, end: 7, type: "N", label: "Lote de Serviço" },
      { name: "tipo_registro", ruleId: "G003", start: 8, end: 8, type: "N", label: "Tipo de Registro", default: "3" },
      { name: "numero_sequencial", ruleId: "G038", start: 9, end: 13, type: "N", label: "Nº Sequencial no Lote" },
      { name: "codigo_segmento", ruleId: "G039", start: 14, end: 14, type: "A", label: "Código Segmento", default: "T" },
      { name: "uso_exclusivo_febraban_1", ruleId: "G004", start: 15, end: 15, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " },
      { name: "codigo_movimento", ruleId: "C044", start: 16, end: 17, type: "N", label: "Código Movimento Retorno" },
      { name: "agencia_mantenedora", ruleId: "G008", start: 18, end: 22, type: "N", label: "Agência Mantenedora" },
      { name: "agencia_dv", ruleId: "G009", start: 23, end: 23, type: "A", label: "Dígito Verificador Agência" },
      { name: "numero_conta", ruleId: "G010", start: 24, end: 35, type: "N", label: "Número da Conta Corrente" },
      { name: "conta_dv", ruleId: "G011", start: 36, end: 36, type: "A", label: "Dígito Verificador Conta" },
      { name: "agencia_conta_dv", ruleId: "G012", start: 37, end: 37, type: "A", label: "Dígito Verificador Ag/Conta" },
      { name: "nosso_numero", ruleId: "G069", start: 38, end: 57, type: "A", label: "Nosso Número" },
      { name: "carteira", ruleId: "C006", start: 58, end: 58, type: "N", label: "Código da Carteira" },
      { name: "numero_documento", ruleId: "C011", start: 59, end: 73, type: "A", label: "Número do Documento" },
      { name: "vencimento", ruleId: "C012", start: 74, end: 81, type: "N", label: "Data de Vencimento" },
      { name: "valor_titulo", ruleId: "G070", start: 82, end: 96, type: "N", label: "Valor Nominal do Título" },
      { name: "banco_cobrador", ruleId: "C045", start: 97, end: 99, type: "N", label: "Número do Banco Cobrador" },
      { name: "agencia_cobradora", ruleId: "G008", start: 100, end: 104, type: "N", label: "Agência Cobradora" },
      { name: "agencia_cobradora_dv", ruleId: "G009", start: 105, end: 105, type: "A", label: "DV Agência Cobradora" },
      { name: "identificacao_titulo_empresa", ruleId: "G072", start: 106, end: 130, type: "A", label: "Identificador Título Empresa" },
      { name: "codigo_moeda", ruleId: "G065", start: 131, end: 132, type: "N", label: "Código da Moeda" },
      { name: "pagador_tipo_inscricao", ruleId: "G005", start: 133, end: 133, type: "N", label: "Tipo Inscrição Pagador" },
      { name: "pagador_numero_inscricao", ruleId: "G006", start: 134, end: 148, type: "N", label: "Número Inscrição Pagador" },
      { name: "pagador_nome", ruleId: "G013", start: 149, end: 188, type: "A", label: "Nome do Pagador" },
      { name: "numero_contrato", ruleId: "C030", start: 189, end: 198, type: "N", label: "Número do Contrato" },
      { name: "valor_tarifas", ruleId: "G076", start: 199, end: 213, type: "N", label: "Valor das Tarifas/Custas" },
      { name: "motivo_ocorrencia", ruleId: "C047", start: 214, end: 223, type: "A", label: "Motivo da Ocorrência" },
      { name: "uso_exclusivo_febraban_2", ruleId: "G004", start: 224, end: 240, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " }
    ]
  }
};
