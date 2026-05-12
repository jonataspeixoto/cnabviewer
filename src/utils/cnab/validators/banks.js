/**
 * Algoritmos de Dígito Verificador (DV) específicos para bancos brasileiros.
 * Baseado nos manuais técnicos de cada instituição.
 */

export const bankAlgorithms = {
  // BANCO DO BRASIL (001)
  "001": {
    calculateDVAgencia: (agencia) => {
      // Módulo 11 com base 9
      return calculateModulo11(agencia, 9);
    },
    calculateDVConta: (conta) => {
      return calculateModulo11(conta, 9);
    }
  },

  // ITAÚ (341)
  "341": {
    calculateDVAgenciaConta: (agencia, conta) => {
      // Itaú costuma validar o par agência/conta no Módulo 10
      const s = agencia.padStart(4, '0') + conta.padStart(5, '0');
      return calculateModulo10(s);
    }
  },

  // BRADESCO (237)
  "237": {
    calculateDVAgencia: (agencia) => {
      let dv = calculateModulo11(agencia, 7);
      return dv === "0" ? "0" : dv === "1" ? "P" : dv;
    },
    calculateDVConta: (conta) => {
      return calculateModulo11(conta, 7);
    }
  }
};

/**
 * Módulo 11 Padrão FEBRABAN
 */
function calculateModulo11(input, base) {
  const digits = String(input).replace(/\D/g, '').split('').reverse();
  let sum = 0;
  let multiplier = 2;

  for (const digit of digits) {
    sum += parseInt(digit) * multiplier;
    multiplier = multiplier >= base ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const dv = 11 - remainder;

  if (dv === 10 || dv === 11) return "0";
  return String(dv);
}

/**
 * Módulo 10 Padrão (Soma dos dígitos)
 */
function calculateModulo10(input) {
  const digits = String(input).replace(/\D/g, '').split('').reverse();
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    let n = parseInt(digits[i]) * (i % 2 === 0 ? 2 : 1);
    if (n > 9) n -= 9;
    sum += n;
  }

  const remainder = sum % 10;
  const dv = 10 - remainder;

  return dv === 10 ? "0" : String(dv);
}
