import { bankAlgorithms } from '../validators/banks.js';

/**
 * Validadores Genéricos baseados nos tipos do Manual FEBRABAN
 */
export const validators = {
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
    if (raw.length === 15 && raw[0] !== '0') {
      return "Erro: Em campo de 15 posições, a 1ª posição deve ser zero";
    }

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

    const formaLancamento = row.forma_lancamento || "";
    if (formaLancamento !== "45") {
      return validators.alphanumeric(val);
    }

    const g100 = row.forma_iniciacao || row.g100 || "";
    switch (g100) {
      case "01": return /^\+?[0-9]{10,14}$/.test(cleanVal) || "Formato de Telefone Inválido (Esperado: +55...)";
      case "02": return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanVal) || "Formato de E-mail Inválido";
      case "03": return validators.dynamicTaxId(cleanVal);
      case "04": return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanVal) || "Chave Aleatória deve ser um UUID válido (8-4-4-4-12 caracteres)";
      default: return /^[A-Z0-9@.\-/ ]*$/i.test(cleanVal) || "Chave PIX contém caracteres inválidos";
    }
  },

  batchNumber: (val, row) => {
    if (!/^\d+$/.test(val)) return "Lote de serviço deve ser numérico";
    const tipo = row.tipo_registro || row.tipo;
    const num = parseInt(val);
    if (tipo === "0" && num !== 0) return "Header de Arquivo deve ter Lote 0000";
    if (tipo === "9" && num !== 9999) return "Trailer de Arquivo deve ter Lote 9999";
    return true;
  },
  filler: () => true
};

/**
 * Validador Especial de DV Bancário
 */
export const validateBankDV = (val, row) => {
  const banco = row.banco?.trim() || row.codigo_banco?.trim();
  const algoritmo = bankAlgorithms[banco];
  if (!algoritmo) return true;
  if (banco === "341" && algoritmo.calculateDVAgenciaConta) {
    const dvEsperado = algoritmo.calculateDVAgenciaConta(row.agencia || row.agencia_mantenedora, row.conta || row.numero_conta);
    return val.trim() === dvEsperado || `DV Inválido para Itaú (Esperado: ${dvEsperado})`;
  }
  return true;
};
