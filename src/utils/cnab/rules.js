import { bankAlgorithms } from './validators/banks.js';

/**
 * Validadores Genéricos baseados nos tipos do Manual
 */
const validators = {
  numeric: (val) => /^\d+$/.test(val) || "Deve ser estritamente numérico",
  alphanumeric: (val) => {
    if (!val) return true;
    // Norma FEBRABAN: Apenas A-Z (sem acento), 0-9 e Espaço
    return /^[A-Z0-9 ]*$/.test(val) || "Alfanuméricos devem conter apenas letras (A-Z), números (0-9) e espaço (sem acentos ou símbolos)";
  },
  oneOf: (val, values) => {
    const cleanVal = val.trim();
    return values.includes(cleanVal) || `Valor [${cleanVal}] inválido. Esperado um de: ${values.join(', ')}`;
  },
  date: (val) => {
    if (!val || val.trim() === "" || val === "00000000" || val === "        ") return true;
    const d = parseInt(val.substring(0, 2));
    const m = parseInt(val.substring(2, 4));
    const y = parseInt(val.substring(4, 8));
    const date = new Date(y, m - 1, d);
    return (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) || "Data inexistente";
  },
  time: (val) => {
    if (!val || val.trim() === "" || val === "000000" || val === "      ") return true;
    return /^([01]\d|2[0-3])[0-5]\d[0-5]\d$/.test(val) || "Hora inválida (HHMMSS)";
  },
  uf: (val) => {
    const ufs = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
    return ufs.includes(val.trim().toUpperCase()) || "UF inexistente";
  },
  amount: (val) => /^\d+$/.test(val) || "Valor deve ser numérico (centavos)",
  dynamicTaxId: (val) => {
    if (!val || val.trim() === "" || /^[0 ]+$/.test(val)) return true;
    
    const raw = val.trim();
    
    // Se o campo tem 15 caracteres, o primeiro DEVE ser '0'
    if (raw.length === 15 && raw[0] !== '0') {
      return "Erro: Em campo de 15 posições, a 1ª posição deve ser zero";
    }

    // Pega o conteúdo útil (removendo o preenchimento de zeros à esquerda se for campo de 15)
    const cleanStr = raw.length === 15 ? raw.substring(1) : raw;
    const significant = cleanStr.replace(/^0+/, '');

    const validateCPF = (cpf) => {
      const s = cpf.padStart(11, '0');
      if (s.length !== 11 || /^(\d)\1+$/.test(s) || /\D/.test(s)) return false;
      let sum = 0, rest;
      for (let i = 1; i <= 9; i++) sum += parseInt(s.substring(i-1, i)) * (11 - i);
      rest = (sum * 10) % 11;
      if (rest === 10 || rest === 11) rest = 0;
      if (rest !== parseInt(s.substring(9, 10))) return false;
      sum = 0;
      for (let i = 1; i <= 10; i++) sum += parseInt(s.substring(i-1, i)) * (12 - i);
      rest = (sum * 10) % 11;
      if (rest === 10 || rest === 11) rest = 0;
      return rest === parseInt(s.substring(10, 11));
    };

    const validateCNPJ = (cnpj) => {
      const s = cnpj.padStart(14, '0').toUpperCase();
      if (s.length !== 14) return false;
      
      const getVal = (c) => {
        const code = c.charCodeAt(0);
        return (code >= 65 && code <= 90) ? (code - 55) : parseInt(c);
      };

      const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

      let sum = 0;
      for (let i = 0; i < 12; i++) sum += getVal(s[i]) * weights1[i];
      let res = sum % 11;
      let dv1 = res < 2 ? 0 : 11 - res;
      if (parseInt(s[12]) !== dv1) return false;

      sum = 0;
      for (let i = 0; i < 13; i++) sum += getVal(s[i]) * weights2[i];
      res = sum % 11;
      let dv2 = res < 2 ? 0 : 11 - res;
      return parseInt(s[13]) === dv2;
    };

    const hasAlpha = /[A-Z]/i.test(significant);
    if (significant.length > 11 || hasAlpha) {
      return validateCNPJ(cleanStr.slice(-14)) || "CNPJ Inválido (incluindo Alfanumérico)";
    } else if (significant.length > 0) {
      return validateCPF(significant) || "CPF Inválido";
    }
    
    return true;
  },
  pixKey: (val, row) => {
    const cleanVal = val.trim();
    if (!cleanVal) return true;

    // Se NÃO for PIX (Forma de Lançamento 45), deve ser Alfanumérico Estrito
    const formaLancamento = row.forma_lancamento || "";
    if (formaLancamento !== "45") {
      return validators.alphanumeric(val);
    }

    // G100: 01=Telefone, 02=Email, 03=CPF/CNPJ, 04=Chave Aleatória
    const g100 = row.forma_iniciacao || row.g100 || "";
    
    switch (g100) {
      case "01": // Telefone
        return /^\+?[0-9]{10,14}$/.test(cleanVal) || "Formato de Telefone Inválido (Esperado: +55...)";
      case "02": // Email
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanVal) || "Formato de E-mail Inválido";
      case "03": // CPF/CNPJ
        return validators.dynamicTaxId(cleanVal);
      case "04": // Chave Aleatória (UUID)
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanVal) || "Chave Aleatória deve ser um UUID válido (8-4-4-4-12 caracteres)";
      default:
        // Chave genérica Pix permite alguns caracteres especiais (@, ., -, /)
        return /^[A-Z0-9@.\-/ ]*$/i.test(cleanVal) || "Chave PIX contém caracteres inválidos";
    }
  },
  filler: () => true
};

/**
 * CNAB_RULES_DATABASE
 * Mapeamento COMPLETO e ATUALIZADO (Manual FEBRABAN v10.9)
 */
const DATABASE = [
  // G - CAMPOS GENÉRICOS
  { id: "G001", name: "Código do Banco", desc: "Código do Banco na Compensação", validation: "numeric" },
  { id: "G002", name: "Lote de Serviço", desc: "Número sequencial para identificar o lote", validation: "numeric" },
  { id: "G003", name: "Tipo de Registro", desc: "Identifica a função da linha", validation: "oneOf", values: ["0", "1", "2", "3", "4", "5", "9"], options: [
    { value: "0", label: "Header de Arquivo", description: "Primeira linha do arquivo, contém informações gerais do transmissor." },
    { value: "1", label: "Header de Lote", description: "Início de um lote de serviço." },
    { value: "2", label: "Registros Iniciais de Lote", description: "Dados complementares do lote." },
    { value: "3", label: "Segmentos de Detalhe", description: "Registros que contêm os dados dos títulos/pagamentos (A, B, J, P, Q, R...)." },
    { value: "4", label: "Registros Finais de Lote", description: "Dados complementares de fechamento do lote." },
    { value: "5", label: "Trailer de Lote", description: "Final de um lote de serviço, contém totais do lote." },
    { value: "9", label: "Trailer de Arquivo", description: "Última linha do arquivo, contém totais gerais." }
  ]},
  { id: "G004", name: "Uso Exclusivo FEBRABAN", desc: "Campo de preenchimento com brancos ou zeros", validation: "filler" },
  { id: "G005", name: "Tipo de Inscrição", desc: "Tipo de documento da empresa/pessoa", validation: "oneOf", values: ["0", "1", "2", "3", "9"], options: [
    { value: "0", label: "Isento / Não Informado", description: "Quando não há documento ou é isento de inscrição." },
    { value: "1", label: "CPF", description: "Pessoa Física (11 dígitos úteis)." },
    { value: "2", label: "CGC / CNPJ", description: "Pessoa Jurídica (14 dígitos úteis)." },
    { value: "3", label: "PIS / PASEP", description: "Número de inscrição no PIS/PASEP." },
    { value: "9", label: "Outros", description: "Outros tipos de identificação não listados." }
  ]},
  { id: "G006", name: "Número de Inscrição", desc: "Número de CPF ou CNPJ conforme G005", validation: "dynamicTaxId" },
  { id: "G007", name: "Código do Convênio", desc: "Código do convênio firmado entre a Empresa e o Banco", validation: "alphanumeric" },
  { id: "G008", name: "Agência Mantenedora", desc: "Código da Agência sem o dígito verificador", validation: "numeric" },
  { id: "G009", name: "Dígito Verificador da Agência", desc: "DV da agência mantenedora", validation: "alphanumeric" },
  { id: "G010", name: "Número da Conta Corrente", desc: "Número da conta corrente sem o dígito verificador", validation: "numeric" },
  { id: "G011", name: "Dígito Verificador da Conta", desc: "DV da conta corrente", validation: "alphanumeric" },
  { id: "G012", name: "Dígito Verificador da Ag/Conta", desc: "DV do par Agência/Conta", validation: "alphanumeric" },
  { id: "G013", name: "Nome da Empresa/Favorecido", desc: "Nome que identifica a entidade", validation: "alphanumeric" },
  { id: "G015", name: "Cód. Remessa/Retorno", desc: "Identifica a direção do arquivo", validation: "oneOf", values: ["1", "2"], options: [
    { value: "1", label: "Remessa", description: "Arquivo enviado da Empresa para o Banco (Instruções)." },
    { value: "2", label: "Retorno", description: "Arquivo enviado do Banco para a Empresa (Confirmações/Liquidações)." }
  ]},
  { id: "G016", name: "Data de Geração", desc: "Data no formato DDMMAAAA", validation: "date" },
  { id: "G017", name: "Hora de Geração", desc: "Hora no formato HHMMSS", validation: "time" },
  { id: "G018", name: "Sequencial NSA", desc: "Número Sequencial do Arquivo", validation: "numeric" },
  { id: "G019", name: "Versão do Layout", desc: "Número da versão do layout (Ex: 103)", validation: "numeric" },
  { id: "G025", name: "Tipo de Serviço", desc: "Finalidade do lote", validation: "oneOf", values: ["01", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "20", "22", "23", "25", "26", "29", "30", "32", "33", "34", "40", "41", "50", "60", "70", "75", "77", "80", "90", "98"], options: [
    { value: "01", label: "Cobrança", description: "Serviços de cobrança de títulos." },
    { value: "03", label: "Boleto de Pagamento", description: "Processamento de boletos bancários." },
    { value: "04", label: "Conciliação Bancária", description: "Envio de extratos para conferência de saldos." },
    { value: "05", label: "Débitos", description: "Instruções de débitos diversos." },
    { value: "06", label: "Custódia de Cheques", description: "Gestão de cheques para custódia." },
    { value: "07", label: "Gestão de Caixa", description: "Movimentações para gestão financeira." },
    { value: "08", label: "Consulta/Informação de Margem", description: "Consulta de limites e margens." },
    { value: "09", label: "Averbação de Empréstimo/Consignação", description: "Registro de empréstimos consignados." },
    { value: "10", label: "Pagamento Dividendos", description: "Distribuição de lucros aos acionistas." },
    { value: "11", label: "Manutenção de Consignado", description: "Gestão de contratos de consignação." },
    { value: "12", label: "Consignação de Empréstimo", description: "Novo contrato de consignação." },
    { value: "13", label: "Glosa de Empréstimo", description: "Cancelamento ou suspensão de consignação." },
    { value: "14", label: "Consulta de Empréstimo", description: "Verificação de status de empréstimo." },
    { value: "20", label: "Pagamento Fornecedor", description: "Liquidação de faturas de fornecedores." },
    { value: "22", label: "Pagamento de Contas, Tributos e Impostos", description: "Quitação de boletos de concessionárias e impostos." },
    { value: "25", label: "Comprador", description: "Operações de compra." },
    { value: "26", label: "Vendedor", description: "Operações de venda." },
    { value: "29", label: "Lançamento do Crédito Imobiliário", description: "Crédito referente a financiamento habitacional." },
    { value: "30", label: "Pagamento Salários", description: "Crédito de folha de pagamento de funcionários." },
    { value: "32", label: "Pagamento de Honorários", description: "Pagamento de serviços profissionais prestados." },
    { value: "33", label: "Pagamento de Bolsa Auxílio", description: "Crédito para estagiários ou beneficiários." },
    { value: "34", label: "Pagamento de Precatórios", description: "Liquidação de dívidas judiciais do governo." },
    { value: "40", label: "Consulta de Saldo", description: "Verificação de disponibilidade em conta." },
    { value: "41", label: "Consulta de Extrato", description: "Verificação de movimentações recentes." },
    { value: "50", label: "Gestão de Caixa", description: "Operações estruturadas de tesouraria." },
    { value: "60", label: "Recebimento", description: "Identificação de créditos recebidos." },
    { value: "70", label: "Pagamento Letra de Câmbio", description: "Resgate ou pagamento de títulos de crédito." },
    { value: "75", label: "Pagamento de Municípios", description: "Transferências para prefeituras." },
    { value: "77", label: "Pagamento de Estado", description: "Transferências para governos estaduais." },
    { value: "80", label: "Pagamento Eletrônico Tributos", description: "Quitação de impostos federais (DARF, GPS)." },
    { value: "90", label: "Pagamento de Empréstimos/Financiamentos", description: "Liquidação de parcelas de crédito." },
    { value: "98", label: "Pagamentos Diversos", description: "Outros tipos de pagamentos não especificados." }
  ]},
  { id: "G028", name: "Tipo de Operação", desc: "Natureza dos lançamentos no lote", validation: "oneOf", values: ["C", "D", "E", "G", "I", "R", "T"], options: [
    { value: "C", label: "Lançamentos a Crédito", description: "Entrada de recursos na conta do favorecido." },
    { value: "D", label: "Lançamentos a Débito", description: "Saída de recursos da conta do pagador." },
    { value: "E", label: "Extrato para Conciliação", description: "Fluxo de informações de extrato." },
    { value: "G", label: "Extrato para Gestão de Caixa", description: "Fluxo de informações para tesouraria." },
    { value: "I", label: "Informações de Títulos Capturados", description: "Dados de títulos processados." },
    { value: "R", label: "Arquivos de Remessa", description: "Fluxo Empresa -> Banco (Instruções)." },
    { value: "T", label: "Arquivos de Retorno", description: "Fluxo Banco -> Empresa (Confirmações)." }
  ]},
  { id: "G029", name: "Forma de Lançamento", desc: "Meio de pagamento/recebimento", validation: "oneOf", values: ["01", "02", "03", "04", "05", "10", "11", "16", "17", "18", "19", "20", "21", "30", "31", "40", "41", "43", "44", "45", "47", "50", "70", "71", "72", "73", "80", "81"], options: [
    { value: "01", label: "Crédito em Conta Corrente", description: "Transferência interna entre contas no mesmo banco." },
    { value: "02", label: "Cheque Pagamento / Administrativo", description: "Emissão de cheque para quitação." },
    { value: "03", label: "DOC / TED", description: "Transferência interbancária via compensação ou SPB." },
    { value: "04", label: "Cartão Salário", description: "Crédito em cartão específico para folha." },
    { value: "05", label: "Crédito em Conta Poupança", description: "Transferência interna para poupança no mesmo banco." },
    { value: "10", label: "OP à Disposição", description: "Ordem de Pagamento para saque em guichê." },
    { value: "11", label: "Pagamento de Contas e Tributos", description: "Quitação de boletos com código de barras." },
    { value: "16", label: "Tributos - DARF Normal", description: "Pagamento de impostos federais normais." },
    { value: "17", label: "Tributos - GPS", description: "Guia da Previdência Social." },
    { value: "18", label: "Tributos - DARF Simples", description: "Imposto para empresas do Simples Nacional." },
    { value: "19", label: "Tributos - IPTU", description: "Imposto Predial e Territorial Urbano." },
    { value: "20", label: "Tributos - DARJ", description: "Documento de Arrecadação do Rio de Janeiro." },
    { value: "21", label: "Tributos - GARE-SP", description: "Guia de Arrecadação de Receitas Estaduais de SP." },
    { value: "30", label: "Liquidação de Títulos no Próprio Banco", description: "Pagamento de boleto emitido pelo mesmo banco." },
    { value: "31", label: "Pagamento de Títulos de Outros Bancos", description: "Pagamento de boleto via compensação." },
    { value: "40", label: "Extrato de Conta Corrente", description: "Lançamento informativo de extrato." },
    { value: "41", label: "TED - Outra Titularidade", description: "TED para CPFs/CNPJs diferentes do pagador." },
    { value: "43", label: "TED - Mesma Titularidade", description: "TED entre contas do mesmo titular." },
    { value: "44", label: "TED para Transferência de Conta Investimento", description: "Movimentação de fundos para investimento." },
    { value: "45", label: "PIX", description: "Pagamento instantâneo via arranjo PIX." },
    { value: "47", label: "Transferência para Conta Corrente", description: "Transferência entre contas de mesma titularidade internamente." },
    { value: "50", label: "Débito em Conta Corrente", description: "Lançamento de débito direto." },
    { value: "70", label: "Extrato para Gestão de Caixa", description: "Lançamento consolidado para tesouraria." },
    { value: "71", label: "Depósito Judicial em Conta Corrente", description: "Bloqueio ou depósito via ordem judicial." },
    { value: "72", label: "Depósito Judicial em Conta Poupança", description: "Bloqueio ou depósito judicial em poupança." },
    { value: "73", label: "Extrato de Conta Investimento", description: "Informação de movimentação em investimentos." },
    { value: "80", label: "Pagamento de Tributos Municipais (ISS)", description: "Quitação de imposto sobre serviços." },
    { value: "81", label: "Pagamento de Tributos Estaduais (ICMS)", description: "Quitação de imposto sobre circulação de mercadorias." }
  ]},
  { id: "G031", name: "Outras Informações", desc: "Informações complementares (PIX/SIAPE/Mensagens)", validation: "pixKey" },
  { id: "G036", name: "Estado/UF", desc: "Sigla da Unidade da Federação", validation: "uf" },
  { id: "G040", name: "Tipo de Moeda (Alfa)", desc: "Identificação da Moeda (Alfa)", validation: "oneOf", values: ["BTN", "BRL", "USD", "PTE", "FRF", "CHF", "JPY", "GBP", "DEM", "TRD", "UPC", "UPF", "UFR", "XEU"] },
  { id: "G041", name: "Quantidade da Moeda", desc: "Quantidade de unidades da moeda", validation: "amount" },
  { id: "G043", name: "Nº Documento (Banco)", desc: "Número do documento atribuído pelo Banco", validation: "alphanumeric" },
  { id: "G059", name: "Ocorrências (Retorno)", desc: "Códigos de ocorrências para retorno", validation: "alphanumeric" },
  { id: "G060", name: "Tipo de Movimento", desc: "Tipo de instrução de movimento", validation: "oneOf", values: ["0", "1", "2", "3", "4", "5", "7", "9"], options: [
    { value: "0", label: "Inclusão", description: "Solicita a inclusão de um novo registro liberado para processamento." },
    { value: "1", label: "Consulta", description: "Solicita consulta de dados do registro." },
    { value: "2", label: "Suspensão", description: "Solicita o bloqueio temporário do registro." },
    { value: "3", label: "Estorno / Exclusão", description: "Solicita o cancelamento de um registro anteriormente enviado." },
    { value: "4", label: "Reativação", description: "Solicita o desbloqueio do registro." },
    { value: "5", label: "Alteração", description: "Solicita a modificação de dados de um registro já existente." },
    { value: "7", label: "Liquidação", description: "Indica que o título/pagamento foi liquidado." },
    { value: "9", label: "Exclusão de Lote", description: "Solicita a exclusão de todos os registros do lote." }
  ]},
  { id: "G061", name: "Código Instrução Movimento", desc: "Ação a ser realizada", validation: "numeric" },
  { id: "G064", name: "Nº Documento (Empresa)", desc: "Número do documento atribuído pela Empresa", validation: "alphanumeric" },
  { id: "G065", name: "Código da Moeda (Num)", desc: "Identificação da Moeda (Numérico)", validation: "oneOf", values: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"], options: [
    { value: "09", label: "Real (BRL)", description: "Moeda oficial do Brasil." }
  ]},
  { id: "G067", name: "Cód. Registro Opcional", desc: "Identifica se o registro é complementar (ex: 52)", validation: "oneOf", values: ["52"] },
  { id: "G081", name: "Situação Saldo Inicial", desc: "Débito ou Crédito", validation: "oneOf", values: ["C", "D"] },
  { id: "G082", name: "Posição Saldo Inicial", desc: "Composição do saldo", validation: "oneOf", values: ["P", "F", "I"] },
  { id: "G100", name: "Forma de Iniciação Pix", desc: "Tipo de chave ou forma de iniciação", validation: "oneOf", values: ["01", "02", "03", "04", "05", "06", "07"], options: [
    { value: "01", label: "Chave Pix - Telefone", description: "Iniciação via número de celular." },
    { value: "02", label: "Chave Pix - E-mail", description: "Iniciação via endereço de e-mail." },
    { value: "03", label: "Chave Pix - CPF/CNPJ", description: "Iniciação via documento de identidade." },
    { value: "04", label: "Chave Pix - Aleatória", description: "Iniciação via EVP (Endereço Virtual de Pagamento)." },
    { value: "05", label: "Dados Bancários", description: "Iniciação via Agência e Conta." },
    { value: "06", label: "QR Code Dinâmico", description: "Iniciação via QR Code gerado para uma transação específica." },
    { value: "07", label: "QR Code Estático", description: "Iniciação via QR Code fixo do recebedor." }
  ]},
  { id: "G101", name: "Informação Complementar", desc: "Informação 10, 11 ou 12 (Chave PIX)", validation: "pixKey" },
  { id: "G102", name: "Chave Pix / TXID", desc: "URL, Chave de Endereçamento ou Identificador da Transação", validation: "pixKey" },
  { id: "G103", name: "Tipo de Chave DICT", desc: "Tipo da chave Pix", validation: "oneOf", values: ["1", "2", "3", "4", "5"], options: [
    { value: "1", label: "CPF / CNPJ", description: "Chave baseada no documento do favorecido." },
    { value: "2", label: "E-mail", description: "Chave baseada no endereço de correio eletrônico." },
    { value: "3", label: "Telefone", description: "Chave baseada no número de telefone celular." },
    { value: "4", label: "Chave Aleatória", description: "Chave gerada aleatoriamente pelo DICT." }
  ]},

  // G - CAMPOS ADICIONAIS DE ENDEREÇO E VALORES
  { id: "G032", name: "Endereço", desc: "Logradouro, Número ou Complemento", validation: "alphanumeric" },
  { id: "G033", name: "Cidade", desc: "Nome da Cidade", validation: "alphanumeric" },
  { id: "G034", name: "CEP", desc: "Código de Endereçamento Postal", validation: "numeric" },
  { id: "G035", name: "Complemento CEP", desc: "Complemento do CEP", validation: "alphanumeric" },
  { id: "G042", name: "Valor Nominal", desc: "Valor do documento ou lançamento", validation: "amount" },
  { id: "G044", name: "Data Vencimento", desc: "Data de vencimento nominal (DDMMAAAA)", validation: "date" },
  { id: "G045", name: "Valor Abatimento", desc: "Valor do abatimento", validation: "amount" },
  { id: "G046", name: "Valor Desconto", desc: "Valor do desconto", validation: "amount" },
  { id: "G047", name: "Valor Mora", desc: "Valor dos juros de mora", validation: "amount" },
  { id: "G048", name: "Valor Multa", desc: "Valor da multa", validation: "amount" },

  // D - DÉBITO EM CONTA
  { id: "D009", name: "Cód/Doc. Pagador", desc: "Código ou Documento de Identificação do Pagador", validation: "alphanumeric" },

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
  { id: "C063", name: "Código de Barras", desc: "Linha digitável ou código de barras do boleto", validation: "numeric" },

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
  { id: "P016", name: "Número Conta Pagamento", desc: "Conta destino em Instituições de Pagamento", validation: "numeric" }
];

// Transforma o DATABASE no formato consumível CNAB_RULES
export const CNAB_RULES = DATABASE.reduce((acc, rule) => {
  acc[rule.id] = {
    label: rule.name,
    desc: rule.desc,
    options: rule.options,
    validate: (val, row) => {
      const validator = validators[rule.validation];
      if (!validator) return true;
      return validator(val, rule.values || row);
    }
  };
  return acc;
}, {});

// Regras Customizadas e Específicas
CNAB_RULES["BANK_DV"] = {
  label: "Dígito Verificador Bancário",
  validate: (val, row) => {
    const banco = row.banco?.trim() || row.codigo_banco?.trim();
    const algoritmo = bankAlgorithms[banco];
    if (!algoritmo) return true;
    if (banco === "341" && algoritmo.calculateDVAgenciaConta) {
      const dvEsperado = algoritmo.calculateDVAgenciaConta(row.agencia || row.agencia_mantenedora, row.conta || row.numero_conta);
      return val.trim() === dvEsperado || `DV Inválido para Itaú (Esperado: ${dvEsperado})`;
    }
    return true;
  }
};
