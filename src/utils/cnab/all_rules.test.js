import { describe, it, expect } from 'vitest';
import { CNAB_RULES } from './rules';

describe('Automatic Rule Coverage (100%)', () => {
  const ruleIds = Object.keys(CNAB_RULES);

  ruleIds.forEach(id => {
    const rule = CNAB_RULES[id];

    describe(`Rule ${id}: ${rule.label}`, () => {
      it('should pass at least one valid case', () => {
        let testValue = " ";
        let context = {};

        // Determina um valor de teste válido baseado no tipo de validação
        switch (rule.type) {
          case 'oneOf':
            testValue = rule.values[0];
            break;
          case 'numeric':
            testValue = "123".padStart(5, '0');
            break;
          case 'alphanumeric':
            testValue = "ABC 123";
            break;
          case 'date':
            testValue = "01012024";
            break;
          case 'time':
            testValue = "120000";
            break;
          case 'amount':
            testValue = "00000000000100";
            break;
          case 'uf':
            testValue = "SP";
            break;
          case 'dynamicTaxId':
            testValue = "12345678909"; // CPF Válido
            break;
          case 'pixKey':
            testValue = "test@example.com";
            context = { forma_lancamento: '45', forma_iniciacao: '02' };
            break;
          case 'batchNumber':
            testValue = "0001";
            context = { tipo: '1' };
            break;
          case 'filler':
            testValue = " ";
            break;
          default:
            testValue = " ";
        }

        const result = rule.validate(testValue, context);
        if (result !== true) {
          console.error(`Rule ${id} failed validation for value "${testValue}". Error: ${result}`);
        }
        expect(result).toBe(true);
      });

      // Caso de falha genérico para tipos conhecidos (opcional, mas bom para robustez)
      if (['oneOf', 'numeric', 'date', 'time', 'uf'].includes(rule.type)) {
        it('should fail for an obviously invalid value', () => {
          const invalidValue = "!@#$%^&*";
          const result = rule.validate(invalidValue, {});
          expect(typeof result).toBe('string');
        });
      }
    });
  });
});
