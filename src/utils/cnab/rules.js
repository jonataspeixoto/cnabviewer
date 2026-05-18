import { validators, validateBankDV } from './rules/validators.js';
import { GENERIC_RULES } from './rules/definitions/generics.js';
import { PAYMENT_RULES } from './rules/definitions/payments.js';
import { COLLECTION_RULES } from './rules/definitions/collection.js';
import { PIX_RULES } from './rules/definitions/pix.js';

/**
 * Consolidação Atômica de Regras CNAB 240 v10.9
 * O dicionário final é construído a partir das definições modulares.
 */
const DATABASE = [
  ...GENERIC_RULES,
  ...PAYMENT_RULES,
  ...COLLECTION_RULES,
  ...PIX_RULES
];

// Transforma o DATABASE no formato consumível CNAB_RULES
export const CNAB_RULES = DATABASE.reduce((acc, rule) => {
  acc[rule.id] = {
    label: rule.name,
    desc: rule.desc,
    options: rule.options,
    type: rule.validation,
    values: rule.values,
    validate: (val, row) => {
      const validator = validators[rule.validation];
      if (!validator) return true;
      // Passa rule.values como prioridade para validadores que esperam lista de valores
      return validator(val, rule.values || row);
    }
  };
  return acc;
}, {});

// Regras Customizadas e Específicas
CNAB_RULES["BANK_DV"] = {
  label: "Dígito Verificador Bancário",
  validate: validateBankDV
};

CNAB_RULES["STRUC_B"] = {
  label: "Obrigatoriedade do Segmento B",
  desc: "Exige que todo Segmento A seja imediatamente seguido por um Segmento B (Padrão FEBRABAN Rigoroso).",
  validate: () => true // Validação feita via máquina de estados, não por campo individual
};
