/**
 * Dicionário de Regras de Validação CNAB 240 v10.9
 * Baseado na seção 4.0 (Descrição de Campos) do Manual FEBRABAN
 */

export const CNAB_RULES = {
  // G - CAMPOS GENÉRICOS (Pág. 168)
  G: {
    label: "Campos Genéricos",
    items: [
      { id: "G001", name: "Banco", desc: "Código do Banco na Compensação", validation: "numeric", length: 3 },
      { id: "G005", name: "Inscrição Tipo", desc: "0=Isento, 1=CPF, 2=CGC/CNPJ, 3=PIS/PASEP", validation: "oneOf", values: [0, 1, 2, 3, 9] },
      { id: "G006", name: "Inscrição Número", desc: "Número de Inscrição da Empresa/Pessoa Física", validation: "dynamicTaxId" }, // Valida 11 ou 14 dígitos
      { id: "G016", name: "Data", desc: "Data no formato DDMMAAAA", validation: "date", format: "DDMMAAAA" },
      { id: "G017", name: "Hora", desc: "Hora no formato HHMMSS", validation: "time", format: "HHMMSS" },
      { id: "G036", name: "Estado", desc: "Sigla da Unidade da Federação", validation: "uf" },
      { id: "G040", name: "Moeda", desc: "Código da Moeda (Ex: BRL)", validation: "currencyCode" }
    ]
  },

  // P - PAGAMENTOS (Pág. 202)
  P: {
    label: "Pagamentos",
    items: [
      { id: "P001", name: "Câmara", desc: "018=TED, 700=DOC, 009=PIX, 888=ISPB", validation: "oneOf", values: ["018", "700", "009", "888", "018/700"] },
      { id: "P004", name: "Valor Real", desc: "Valor real da efetivação do pagamento", validation: "amount", decimals: 2 },
      { id: "P014", name: "Forma de Pagamento", desc: "Indicativo da forma de pagamento do compromisso", validation: "numeric", length: 2 }
    ]
  },

  // C - TÍTULOS EM COBRANÇA (Pág. 147)
  C: {
    label: "Títulos em Cobrança",
    items: [
      { id: "C004", name: "Movimento Remessa", desc: "Código de instrução para o banco (01=Entrada, 02=Baixa...)", validation: "numeric", length: 2 },
      { id: "C012", name: "Vencimento", desc: "Data de vencimento do título", validation: "dateFuture" },
      { id: "C047", name: "Motivo Ocorrência", desc: "Códigos de erro ou retorno (Ex: '01'=Banco Inválido)", validation: "alphanumeric", length: 10 }
    ]
  },

  // D - DÉBITO EM CONTA CORRENTE (Pág. 162)
  D: {
    label: "Débito em Conta",
    items: [
      { id: "D003", name: "Data Lançamento", desc: "Data prevista para o débito", validation: "date" },
      { id: "D007", name: "Aviso ao Pagador", desc: "0=Não emite, 2=Emite para remetente...", validation: "numeric", length: 1 }
    ]
  },

  // E - EXTRATO CONCILIAÇÃO (Pág. 163)
  E: {
    label: "Conciliação Bancária",
    items: [
      { id: "E002", name: "Saldo Inicial", desc: "Valor do saldo inicial da conta", validation: "amount" },
      { id: "E016", name: "Saldo Bloqueado", desc: "Valores bloqueados acima de 24h", validation: "amount" }
    ]
  },

  // F - GESTÃO DE CAIXA (Pág. 165)
  F: {
    label: "Gestão de Caixa",
    items: [
      { id: "F001", name: "Natureza Saldo", desc: "DPV=Disponível, SCR=Vinculado, SSR=Bloqueado", validation: "oneOf", values: ["DPV", "SCR", "SSR", "SDS"] },
      { id: "F006", name: "Horário Transação", desc: "Horário do registro no banco", validation: "time" }
    ]
  },

  // H - EMPRÉSTIMO CONSIGNADO (Pág. 189)
  H: {
    label: "Empréstimo Consignado",
    items: [
      { id: "H006", name: "CPF Mutuário", desc: "CPF do funcionário tomador", validation: "cpf" },
      { id: "H012", name: "Margem", desc: "Valor da margem disponível", validation: "amount" }
    ]
  },

  // N - PAGAMENTO DE TRIBUTOS (Pág. 198)
  N: {
    label: "Tributos e Impostos",
    items: [
      { id: "N001", name: "Código de Barras", desc: "Código de barras do tributo capturado", validation: "barcodeTribute" },
      { id: "N002", name: "Receita", desc: "Código da receita do tributo", validation: "alphanumeric", length: 6 }
    ]
  },

  // V - VENDOR (Pág. 209)
  V: {
    label: "Vendor",
    items: [
      { id: "V011", name: "Taxa Juros Vendedor", desc: "Percentual de juros do vendedor", validation: "percentage", decimals: 5 },
      { id: "V023", name: "Valor Financiado", desc: "Valor total financiado ao comprador", validation: "amount" }
    ]
  },

  // Z - AUTENTICAÇÃO (Pág. 219)
  Z: {
    label: "Autenticação",
    items: [
      { id: "Z001", name: "Autenticação Legal", desc: "Autenticação gerada para atender a legislação", validation: "alphanumeric", length: 64 },
      { id: "Z002", name: "Protocolo", desc: "Protocolo de autenticação bancária", validation: "alphanumeric", length: 25 }
    ]
  }
};