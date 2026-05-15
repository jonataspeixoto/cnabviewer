export const PAYMENT_RULES = [
  // L - LIQUIDAÇÃO
  { id: "L001", name: "Somatória dos Valores", desc: "Soma total dos pagamentos do lote", validation: "amount" },
  { id: "L002", name: "Valor do Desconto + Abatimento", desc: "Bonificações somadas aos abatimentos", validation: "amount" },
  { id: "L003", name: "Valor da Mora + Multa", desc: "Juros de mora somados à multa paga", validation: "amount" },

  // P - PAGAMENTOS
  { id: "P001", name: "Câmara Centralizadora", desc: "Câmara para processar o pagamento", validation: "oneOf", values: ["018", "700", "988", "009", "018/700"] },
  { id: "P002", name: "Banco Favorecido", desc: "Código do banco que receberá o crédito", validation: "numeric" },
  { id: "P003", name: "Data Real Efetivação", desc: "Data em que o pagamento foi realmente processado", validation: "date" },
  { id: "P004", name: "Valor Real Efetivação", desc: "Valor final processado (13 inteiras, 2 decimais)", validation: "amount" },
  { id: "P006", name: "Aviso ao Favorecido", desc: "Instrução de envio de aviso", validation: "oneOf", values: ["0", "2", "5", "6", "7"] },
  { id: "P009", name: "Data do Pagamento", desc: "Data prevista/agendada para o pagamento", validation: "date" },
  { id: "P010", name: "Valor do Pagamento", desc: "Valor nominal do pagamento", validation: "amount" },
  { id: "P011", name: "Código Finalidade TED", desc: "Finalidade conforme dicionário do BACEN", validation: "alphanumeric" },
  { id: "P012", name: "Código UG Centralizadora", desc: "Código da Unidade Gestora (SIAPE)", validation: "numeric" },
  { id: "P014", name: "Indicativo Forma Pagamento", desc: "Forma de quitação do compromisso", validation: "oneOf", values: ["01", "02", "03"] },
  { id: "P015", name: "Código ISPB", desc: "Identificação do Banco no SPB", validation: "numeric" },
  { id: "P016", name: "Número Conta Pagamento", desc: "Conta destino em Instituições de Pagamento", validation: "numeric" },
  { id: "P007", name: "Somatória dos Valores (Lote)", desc: "Total acumulado de pagamentos no lote", validation: "amount" }
];
