import { bankAlgorithms } from './validators/banks.js';

/**
 * Validadores Genéricos baseados nos tipos do Manual
 */
const validators = {
  numeric: (val) => /^\d+$/.test(val) || "Deve ser estritamente numérico",
  alphanumeric: (val) => true,
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
  { id: "G003", name: "Tipo de Registro", desc: "Identifica a função da linha", validation: "oneOf", values: ["0", "1", "2", "3", "4", "5", "9"] },
  { id: "G004", name: "Uso Exclusivo FEBRABAN", desc: "Campo de preenchimento com brancos ou zeros", validation: "filler" },
  { id: "G005", name: "Tipo de Inscrição", desc: "Tipo de documento da empresa/pessoa", validation: "oneOf", values: ["0", "1", "2", "3", "9"] },
  { id: "G006", name: "Número de Inscrição", desc: "Número de CPF ou CNPJ conforme G005", validation: "dynamicTaxId" },
  { id: "G007", name: "Código do Convênio", desc: "Código do convênio firmado entre a Empresa e o Banco", validation: "alphanumeric" },
  { id: "G008", name: "Agência Mantenedora", desc: "Código da Agência sem o dígito verificador", validation: "numeric" },
  { id: "G009", name: "Dígito Verificador da Agência", desc: "DV da agência mantenedora", validation: "alphanumeric" },
  { id: "G010", name: "Número da Conta Corrente", desc: "Número da conta corrente sem o dígito verificador", validation: "numeric" },
  { id: "G011", name: "Dígito Verificador da Conta", desc: "DV da conta corrente", validation: "alphanumeric" },
  { id: "G012", name: "Dígito Verificador da Ag/Conta", desc: "DV do par Agência/Conta", validation: "alphanumeric" },
  { id: "G013", name: "Nome da Empresa/Favorecido", desc: "Nome que identifica a entidade", validation: "alphanumeric" },
  { id: "G015", name: "Cód. Remessa/Retorno", desc: "Identifica a direção do arquivo", validation: "oneOf", values: ["1", "2"] },
  { id: "G016", name: "Data de Geração", desc: "Data no formato DDMMAAAA", validation: "date" },
  { id: "G017", name: "Hora de Geração", desc: "Hora no formato HHMMSS", validation: "time" },
  { id: "G018", name: "Sequencial NSA", desc: "Número Sequencial do Arquivo", validation: "numeric" },
  { id: "G019", name: "Versão do Layout", desc: "Número da versão do layout (Ex: 103)", validation: "numeric" },
  { id: "G025", name: "Tipo de Serviço", desc: "Finalidade do lote", validation: "oneOf", values: ["01", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "20", "22", "23", "25", "26", "29", "30", "32", "33", "34", "40", "41", "50", "60", "70", "75", "77", "80", "90", "98"] },
  { id: "G028", name: "Tipo de Operação", desc: "Natureza dos lançamentos no lote", validation: "oneOf", values: ["C", "D", "E", "G", "I", "R", "T"] },
  { id: "G029", name: "Forma de Lançamento", desc: "Meio de pagamento/recebimento", validation: "oneOf", values: ["01", "02", "03", "04", "05", "10", "11", "16", "17", "18", "19", "20", "21", "30", "31", "40", "41", "43", "44", "45", "47", "50", "70", "71", "72", "73", "80", "81"] },
  { id: "G031", name: "Outras Informações", desc: "Informações complementares (PIX/SIAPE/Mensagens)", validation: "alphanumeric" },
  { id: "G036", name: "Estado/UF", desc: "Sigla da Unidade da Federação", validation: "uf" },
  { id: "G040", name: "Tipo de Moeda (Alfa)", desc: "Identificação da Moeda (Alfa)", validation: "oneOf", values: ["BTN", "BRL", "USD", "PTE", "FRF", "CHF", "JPY", "GBP", "DEM", "TRD", "UPC", "UPF", "UFR", "XEU"] },
  { id: "G041", name: "Quantidade da Moeda", desc: "Quantidade de unidades da moeda", validation: "amount" },
  { id: "G043", name: "Nº Documento (Banco)", desc: "Número do documento atribuído pelo Banco", validation: "alphanumeric" },
  { id: "G059", name: "Ocorrências (Retorno)", desc: "Códigos de ocorrências para retorno", validation: "alphanumeric" },
  { id: "G060", name: "Tipo de Movimento", desc: "Tipo de instrução de movimento", validation: "oneOf", values: ["0", "1", "2", "3", "4", "5", "7", "9"] },
  { id: "G061", name: "Código Instrução Movimento", desc: "Ação a ser realizada", validation: "numeric" },
  { id: "G064", name: "Nº Documento (Empresa)", desc: "Número do documento atribuído pela Empresa", validation: "alphanumeric" },
  { id: "G065", name: "Código da Moeda (Num)", desc: "Identificação da Moeda (Numérico)", validation: "oneOf", values: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"] },
  { id: "G067", name: "Cód. Registro Opcional", desc: "Identifica se o registro é complementar (ex: 52)", validation: "oneOf", values: ["52"] },
  { id: "G081", name: "Situação Saldo Inicial", desc: "Débito ou Crédito", validation: "oneOf", values: ["C", "D"] },
  { id: "G082", name: "Posição Saldo Inicial", desc: "Composição do saldo", validation: "oneOf", values: ["P", "F", "I"] },
  { id: "G100", name: "Forma de Iniciação Pix", desc: "Meio de iniciação do Pix", validation: "oneOf", values: ["01", "02", "03", "04", "05"] },
  { id: "G101", name: "Informação Complementar", desc: "Informação 10, 11 ou 12 (Chave PIX)", validation: "alphanumeric" },
  { id: "G102", name: "Chave Pix / TXID", desc: "URL, Chave de Endereçamento ou Identificador da Transação", validation: "alphanumeric" },
  { id: "G103", name: "Tipo de Chave DICT", desc: "Tipo da chave Pix", validation: "oneOf", values: ["1", "2", "3", "4", "5"] },

  // C - TÍTULOS EM COBRANÇA
  { id: "C004", name: "Código de Movimento", desc: "01=Entrada, 02=Baixa, 06=Alteração Vencimento, 09=Protestar...", validation: "numeric" },
  { id: "C006", name: "Código da Carteira", desc: "1=Simples, 2=Vinculada, 3=Caucionada, 4=Descontada", validation: "oneOf", values: ["1", "2", "3", "4", "5", "6"] },
  { id: "C008", name: "Tipo de Documento", desc: "1=Tradicional, 2=Escritural", validation: "oneOf", values: ["1", "2"] },
  { id: "C011", name: "Número do Documento", desc: "Número adotado pelo Cliente para identificar o título", validation: "alphanumeric" },
  { id: "C012", name: "Data de Vencimento", desc: "Data de vencimento do título (DDMMAAAA)", validation: "date" },
  { id: "C015", name: "Espécie de Título", desc: "01=CH, 02=DM, 03=DMI, 04=DS, 05=DSI, 08=LC, 12=NP, 17=RC, 31=CC", validation: "numeric" },
  { id: "C018", name: "Código de Juros de Mora", desc: "1=Valor por Dia, 2=Taxa Mensal, 3=Isento", validation: "oneOf", values: ["1", "2", "3"] },
  { id: "C021", name: "Código do Desconto", desc: "1=Valor Fixo, 2=Percentual, 3=Antecipação", validation: "oneOf", values: ["1", "2", "3", "7"] },
  { id: "C026", name: "Código para Protesto", desc: "1=Dias Corridos, 2=Dias Úteis, 3=Não Protestar", validation: "oneOf", values: ["1", "2", "3", "8", "9"] },
  { id: "C028", name: "Código para Baixa/Devolução", desc: "1=Baixar/Devolver, 2=Não Baixar", validation: "oneOf", values: ["1", "2"] },
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
