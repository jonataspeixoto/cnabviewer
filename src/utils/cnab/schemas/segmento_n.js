/**
 * SUB-SCHEMAS DINÂMICOS PARA O SEGMENTO N (Posições 111 a 230)
 * Estratégia: Quando o App detectar Segmento N, ele deve verificar a 
 * "Forma de Lançamento" (G029) no Header do Lote para aplicar o sub-layout.
 */
export const CNAB_SEGMENTO_N_SUB_TYPES = {
  
  // N1: GPS - Guia da Previdência Social (Manual Pág. 37)
  // Ativado se G029 == 17
  gps: [
    { name: "codigo_receita", ruleId: "N002", start: 111, end: 116, type: "A", label: "Código da Receita" },
    { name: "tipo_identificacao_contribuinte", ruleId: "N003", start: 117, end: 118, type: "N", label: "Tipo de Identificação" },
    { name: "identificacao_contribuinte", ruleId: "N004", start: 119, end: 132, type: "N", label: "Identificação Contribuinte" },
    { name: "codigo_identificacao_tributo", ruleId: "N005", start: 133, end: 134, type: "A", label: "Cód. Ident. Tributo" },
    { name: "mes_ano_competencia", ruleId: "N006", start: 135, end: 140, type: "N", label: "Mês/Ano Competência (MMAAAA)" },
    { name: "valor_tributo", ruleId: "G055", start: 141, end: 155, type: "N", label: "Valor do Tributo" },
    { name: "valor_outras_entidades", ruleId: "G054", start: 156, end: 170, type: "N", label: "Valor Outras Entidades" },
    { name: "atualizacao_monetaria", ruleId: "N007", start: 171, end: 185, type: "N", label: "Atualização Monetária" },
    { name: "uso_exclusivo_febraban", ruleId: "G004", start: 186, end: 230, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " }
  ],

  // N2: DARF Comum (Manual Pág. 38)
  // Ativado se G029 == 16
  darf_comum: [
    { name: "codigo_receita", ruleId: "N002", start: 111, end: 116, type: "A", label: "Código da Receita" },
    { name: "tipo_identificacao_contribuinte", ruleId: "N003", start: 117, end: 118, type: "N", label: "Tipo de Identificação" },
    { name: "identificacao_contribuinte", ruleId: "N004", start: 119, end: 132, type: "N", label: "Identificação Contribuinte" },
    { name: "codigo_identificacao_tributo", ruleId: "N005", start: 133, end: 134, type: "A", label: "Cód. Ident. Tributo" },
    { name: "periodo_apuracao", ruleId: "N008", start: 135, end: 142, type: "N", label: "Período de Apuração" },
    { name: "numero_referencia", ruleId: "N009", start: 143, end: 159, type: "N", label: "Número de Referência" },
    { name: "valor_principal", ruleId: "G042", start: 160, end: 174, type: "N", label: "Valor Principal" },
    { name: "valor_multa", ruleId: "G048", start: 175, end: 189, type: "N", label: "Valor da Multa" },
    { name: "valor_juros_encargos", ruleId: "G047", start: 190, end: 204, type: "N", label: "Valor Juros/Encargos" },
    { name: "data_vencimento", ruleId: "G044", start: 205, end: 212, type: "N", label: "Data de Vencimento" },
    { name: "uso_exclusivo_febraban", ruleId: "G004", start: 213, end: 230, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " }
  ],

  // N3: DARF Simples (Manual Pág. 39)
  // Ativado se G029 == 18
  darf_simples: [
    { name: "codigo_receita", ruleId: "N002", start: 111, end: 116, type: "A", label: "Código da Receita", default: "6106" },
    { name: "tipo_identificacao_contribuinte", ruleId: "N003", start: 117, end: 118, type: "N", label: "Tipo de Identificação" },
    { name: "identificacao_contribuinte", ruleId: "N004", start: 119, end: 132, type: "N", label: "Identificação Contribuinte" },
    { name: "codigo_identificacao_tributo", ruleId: "N005", start: 133, end: 134, type: "A", label: "Cód. Ident. Tributo" },
    { name: "periodo_apuracao", ruleId: "N006", start: 135, end: 142, type: "N", label: "Período de Apuração" },
    { name: "valor_receita_bruta", ruleId: "N010", start: 143, end: 157, type: "N", label: "Valor Receita Bruta" },
    { name: "percentual_receita_bruta", ruleId: "N011", start: 158, end: 164, type: "N", label: "Percentual s/ Receita Bruta" },
    { name: "valor_principal", ruleId: "G042", start: 165, end: 179, type: "N", label: "Valor Principal" },
    { name: "valor_multa", ruleId: "G048", start: 180, end: 194, type: "N", label: "Valor da Multa" },
    { name: "valor_juros_encargos", ruleId: "G047", start: 195, end: 209, type: "N", label: "Valor Juros/Encargos" },
    { name: "uso_exclusivo_febraban", ruleId: "G004", start: 210, end: 230, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " }
  ],

  // N5/N6/N7: Veículos (IPVA, DPVAT, Licenciamento) (Manual Pág. 41-43)
  // Ativado se G029 == 25, 26 ou 27
  veiculos_estaduais: [
    { name: "codigo_receita", ruleId: "N002", start: 111, end: 116, type: "A", label: "Código da Receita" },
    { name: "tipo_identificacao_contribuinte", ruleId: "N003", start: 117, end: 118, type: "N", label: "Tipo de Identificação" },
    { name: "identificacao_contribuinte", ruleId: "N004", start: 119, end: 132, type: "N", label: "CPF/CNPJ Proprietário" },
    { name: "codigo_identificacao_tributo", ruleId: "N005", start: 133, end: 134, type: "A", label: "Cód. Ident. Tributo" },
    { name: "ano_exercicio", ruleId: "N015", start: 135, end: 138, type: "N", label: "Ano de Exercício" },
    { name: "renavam", ruleId: "N016", start: 139, end: 147, type: "N", label: "RENAVAM" },
    { name: "uf", ruleId: "G036", start: 148, end: 149, type: "A", label: "UF do Veículo" },
    { name: "municipio", ruleId: "N017", start: 150, end: 154, type: "N", label: "Código Município" },
    { name: "placa", ruleId: "N018", start: 155, end: 161, type: "A", label: "Placa do Veículo" },
    { name: "opcao_pagamento", ruleId: "N019", start: 162, end: 162, type: "N", label: "Opção de Pagamento" },
    { name: "novo_renavam", ruleId: "N016", start: 163, end: 174, type: "N", label: "Novo RENAVAM (Expandido)" },
    { name: "uso_exclusivo_febraban", ruleId: "G004", start: 175, end: 230, type: "A", label: "Uso Exclusivo FEBRABAN/CNAB", default: " " }
  ]
};

export const CNAB_SCHEMA_SEGMENTO_N = {
  // 10. SEGMENTO N - Pagamento de Tributos sem Código de Barras (Manual Pág. 36)
  // Nota: O bloco 111-230 é variável (N1, N2, N3...) dependendo do tributo.
  segmento_n: {
    id: "segmento_n",
    label: "Segmento N - Tributos sem Código de Barras",
    fields: [
      { name: "codigo_banco", ruleId: "G001", start: 1, end: 3, type: "N", label: "Código do Banco" },
      { name: "lote_servico", ruleId: "G002", start: 4, end: 7, type: "N", label: "Lote de Serviço" },
      { name: "tipo_registro", ruleId: "G003", start: 8, end: 8, type: "N", label: "Tipo de Registro", default: "3" },
      { name: "numero_sequencial", ruleId: "G038", start: 9, end: 13, type: "N", label: "Nº Sequencial no Lote" },
      { name: "codigo_segmento", ruleId: "G039", start: 14, end: 14, type: "A", label: "Código Segmento", default: "N" },
      { name: "tipo_movimento", ruleId: "G060", start: 15, end: 15, type: "N", label: "Tipo de Movimento" },
      { name: "codigo_instrucao_movimento", ruleId: "G061", start: 16, end: 17, type: "N", label: "Código Instrução p/ Movimento" },
      { name: "seu_numero", ruleId: "G064", start: 18, end: 37, type: "A", label: "Nº do Docum. Atribuído p/ Empresa" },
      { name: "nosso_numero", ruleId: "G043", start: 38, end: 57, type: "A", label: "Nº do Docum. Atribuído pelo Banco" },
      { name: "nome_contribuinte", ruleId: "G013", start: 58, end: 87, type: "A", label: "Nome do Contribuinte" },
      { name: "data_pagamento", ruleId: "P009", start: 88, end: 95, type: "N", label: "Data do Pagamento" },
      { name: "valor_pagamento", ruleId: "P010", start: 96, end: 110, type: "N", label: "Valor Total do Pagamento" },
      { name: "informacoes_complementares", ruleId: "N000", start: 111, end: 230, type: "A", label: "Informações Específicas do Tributo" },
      { name: "ocorrencias", ruleId: "G059", start: 231, end: 240, type: "A", label: "Códigos das Ocorrências p/ Retorno" }
    ]
  }
};
