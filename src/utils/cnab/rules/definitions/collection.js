export const COLLECTION_RULES = [
  // C - TÍTULOS EM COBRANÇA
  { id: "C004", name: "Código de Movimento", desc: "Tipo de instrução/ocorrência do título", validation: "numeric", options: [
    { value: "01", label: "Entrada de Títulos", description: "Solicita o registro do título no banco para cobrança." },
    { value: "02", label: "Pedido de Baixa", description: "Solicita a baixa do título do sistema bancário (cancelamento)." },
    { value: "04", label: "Concessão de Abatimento", description: "Informa um valor a ser abatido do título." },
    { value: "05", label: "Cancelamento de Abatimento", description: "Anula um abatimento concedido anteriormente." },
    { value: "06", label: "Alteração de Vencimento", description: "Solicita a alteração da data de vencimento." },
    { value: "07", label: "Alteração de Controle do Participante", description: "Modifica o campo de controle da empresa no título." },
    { value: "08", label: "Alteração de Seu Número", description: "Modifica a identificação do título na empresa." },
    { value: "09", label: "Protestar", description: "Instrui o banco a enviar o título para protesto em cartório." },
    { value: "10", label: "Sustar Protesto e Baixar Título", description: "Cancela o protesto e encerra a cobrança." },
    { value: "11", label: "Sustar Protesto e Manter em Carteira", description: "Cancela o protesto mas mantém o título ativo." },
    { value: "12", label: "Alteração de Juros de Mora", description: "Modifica a taxa ou valor dos juros diários por atraso." },
    { value: "13", label: "Alteração de Valor/Percentual de Multa", description: "Modifica as condições de multa do título." },
    { value: "31", label: "Alteração de Outros Dados", description: "Permite alterar campos diversos do registro." },
    { value: "35", label: "Desagendamento de Débito Automático", description: "Cancela uma instrução de débito em conta agendada." }
  ]},
  { id: "C006", name: "Código da Carteira", desc: "Natureza da cobrança", validation: "oneOf", values: ["1", "2", "3", "4", "5", "6"], options: [
    { value: "1", label: "Cobrança Simples", description: "Títulos registrados para cobrança normal." },
    { value: "2", label: "Cobrança Vinculada", description: "Títulos vinculados a uma operação de crédito." },
    { value: "3", label: "Cobrança Caucionada", description: "Títulos em garantia de empréstimos." },
    { value: "4", label: "Cobrança Descontada", description: "Títulos antecipados via desconto bancário." }
  ]},
  { id: "C008", name: "Tipo de Documento", desc: "Formato do documento de cobrança", validation: "oneOf", values: ["1", "2"], options: [
    { value: "1", label: "Tradicional / Papel", description: "Emissão física de boleto." },
    { value: "2", label: "Escritural / Eletrônico", description: "Cobrança totalmente digital." }
  ]},
  { id: "C011", name: "Número do Documento", desc: "Número adotado pelo Cliente para identificar o título", validation: "alphanumeric" },
  { id: "C012", name: "Data de Vencimento", desc: "Data de vencimento do título (DDMMAAAA)", validation: "date" },
  { id: "C015", name: "Espécie de Título", desc: "Natureza da obrigação", validation: "numeric", options: [
    { value: "01", label: "CH - Cheque", description: "Cheque comum." },
    { value: "02", label: "DM - Duplicata Mercantil", description: "Duplicata oriunda de venda de mercadorias." },
    { value: "04", label: "DS - Duplicata de Serviço", description: "Duplicata oriunda de prestação de serviços." },
    { value: "12", label: "NP - Nota Promissória", description: "Título de promessa de pagamento." },
    { value: "17", label: "RC - Recibo", description: "Documento de quitação comum." }
  ]},
  { id: "C018", name: "Código de Juros de Mora", desc: "Forma de cálculo dos juros", validation: "oneOf", values: ["1", "2", "3"], options: [
    { value: "1", label: "Valor por Dia", description: "Cobra um valor fixo em reais por cada dia de atraso." },
    { value: "2", label: "Taxa Mensal", description: "Cobra um percentual mensal pro-rata sobre o valor do título." },
    { value: "3", label: "Isento", description: "Não há cobrança de juros de mora." }
  ]},
  { id: "C021", name: "Código do Desconto", desc: "Tipo de desconto concedido", validation: "oneOf", values: ["1", "2", "3", "7"], options: [
    { value: "1", label: "Valor Fixo Até a Data", description: "Desconto de valor exato se pago até o dia estipulado." },
    { value: "2", label: "Percentual Até a Data", description: "Desconto percentual se pago até o dia estipulado." },
    { value: "3", label: "Valor por Antecipação / Dia", description: "Desconto cumulativo por dia de antecipação." }
  ]},
  { id: "C026", name: "Código para Protesto", desc: "Instrução de protesto automático", validation: "oneOf", values: ["1", "2", "3", "8", "9"], options: [
    { value: "1", label: "Protestar em Dias Corridos", description: "Envia a cartório após X dias corridos do vencimento." },
    { value: "2", label: "Protestar em Dias Úteis", description: "Envia a cartório após X dias úteis do vencimento." },
    { value: "3", label: "Não Protestar", description: "Não envia o título para protesto em caso de inadimplência." }
  ]},
  { id: "C028", name: "Código para Baixa/Devolução", desc: "Ação após decurso de prazo", validation: "oneOf", values: ["1", "2"], options: [
    { value: "1", label: "Baixar / Devolver", description: "Retira o título de cobrança após o prazo estabelecido." },
    { value: "2", label: "Não Baixar / Não Devolver", description: "Mantém o título na carteira indefinidamente." }
  ]},
  { id: "C030", name: "Número do Contrato", desc: "Número do contrato da operação de crédito", validation: "numeric" },
  { id: "C047", name: "Motivo da Ocorrência", desc: "Identifica erros ou status de retorno (Ex: 'A1')", validation: "alphanumeric" },
  { id: "C048", name: "Valor Juros/Multa/Encargos", desc: "Valor dos acréscimos efetuados (Retorno)", validation: "amount" },
  { id: "C052", name: "Valor Pago", desc: "Valor pago pelo pagador (Retorno)", validation: "amount" },
  { id: "C063", name: "Código de Barras", desc: "Linha digitável ou código de barras do boleto", validation: "numeric" }
];
