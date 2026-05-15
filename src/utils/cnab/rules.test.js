import { describe, it, expect } from 'vitest';
import { CNAB_RULES } from './rules';

describe('CNAB_RULES', () => {
  describe('G003 (Tipo de Registro - oneOf)', () => {
    const rule = CNAB_RULES['G003'];
    it('should validate valid types', () => {
      expect(rule.validate('0')).toBe(true);
      expect(rule.validate('3')).toBe(true);
    });
    it('should fail for invalid types', () => {
      expect(typeof rule.validate('X')).toBe('string');
    });
  });

  describe('G013 (Nome Empresa - alphanumeric)', () => {
    const rule = CNAB_RULES['G013'];
    it('should validate valid names', () => {
      expect(rule.validate('EMPRESA LTDA')).toBe(true);
      expect(rule.validate('BANCO 123')).toBe(true);
    });
    it('should fail for accents and special chars', () => {
      expect(typeof rule.validate('EMPRESA S/A')).toBe('string');
      expect(typeof rule.validate('JOÃO SILVA')).toBe('string');
      expect(typeof rule.validate('EMPRESA & CIA')).toBe('string');
    });
  });

  describe('G016 (Data de Geração - date)', () => {
    const rule = CNAB_RULES['G016'];
    it('should validate valid dates', () => {
      expect(rule.validate('31122023')).toBe(true);
      expect(rule.validate('29022024')).toBe(true); // Ano bissexto
    });
    it('should fail for non-existent dates', () => {
      expect(rule.validate('32012023')).toBe('Data inexistente');
      expect(rule.validate('29022023')).toBe('Data inexistente'); // Não bissexto
    });
    it('should allow empty/zero dates', () => {
      expect(rule.validate('00000000')).toBe(true);
      expect(rule.validate('        ')).toBe(true);
    });
  });

  describe('G017 (Hora de Geração - time)', () => {
    const rule = CNAB_RULES['G017'];
    it('should validate valid times', () => {
      expect(rule.validate('235959')).toBe(true);
      expect(rule.validate('000000')).toBe(true);
    });
    it('should fail for invalid times', () => {
      expect(rule.validate('240000')).toBe('Hora inválida (HHMMSS)');
      expect(rule.validate('126000')).toBe('Hora inválida (HHMMSS)');
    });
  });

  describe('G036 (Estado/UF)', () => {
    const rule = CNAB_RULES['G036'];
    it('should validate valid UFs', () => {
      expect(rule.validate('SP')).toBe(true);
      expect(rule.validate('sp')).toBe(true); 
      expect(rule.validate(' RJ ')).toBe(true);
    });
    it('should fail for invalid UFs', () => {
      expect(rule.validate('XX')).toBe('UF inexistente');
    });
  });

  describe('G006 (Número de Inscrição - dynamicTaxId)', () => {
    const rule = CNAB_RULES['G006'];
    it('should validate valid CPF', () => {
      expect(rule.validate('12345678909')).toBe(true);
    });
    it('should fail for invalid CPF', () => {
      expect(rule.validate('11111111111')).toBe('CPF Inválido');
    });
    it('should validate valid CNPJ', () => {
      expect(rule.validate('06990590000123')).toBe(true);
      expect(rule.validate('006990590000123')).toBe(true);
    });
    it('should fail for invalid CNPJ', () => {
      expect(rule.validate('06990590000100')).toBe('CNPJ Inválido (incluindo Alfanumérico)');
    });
  });

  describe('Contextual G031 (Mensagem vs Pix Key)', () => {
    const rule = CNAB_RULES['G031'];
    
    it('should be strict alphanumeric for standard payments (Forma 01)', () => {
      const row = { forma_lancamento: '01' };
      expect(rule.validate('MENSAGEM DE TESTE 123', row)).toBe(true);
      expect(typeof rule.validate('MENSAGEM @ INVÁLIDA', row)).toBe('string');
      expect(typeof rule.validate('ACENTUAÇÃO NÃO PODE', row)).toBe('string');
    });

    it('should allow Pix characters for Pix payments (Forma 45)', () => {
      const row = { forma_lancamento: '45', forma_iniciacao: '02' };
      expect(rule.validate('jonatas@example.com', row)).toBe(true);
      expect(rule.validate('jonatas.exemplo@empresa.com.br', row)).toBe(true);
    });

    it('should validate Phone (G100=01) in Pix context', () => {
      const row = { forma_lancamento: '45', forma_iniciacao: '01' };
      expect(rule.validate('5511999998888', row)).toBe(true);
      expect(rule.validate('+5511999998888', row)).toBe(true);
    });

    it('should validate UUID in Pix context', () => {
      const row = { forma_lancamento: '45', forma_iniciacao: '04' };
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      expect(rule.validate(validUUID, row)).toBe(true);
    });

    it('should validate generic Pix Key with specials', () => {
      const row = { forma_lancamento: '45' }; // Sem g100 definido
      expect(rule.validate('CHAVE-COM-TRACO', row)).toBe(true);
      expect(rule.validate('chave.ponto@email.com', row)).toBe(true);
    });
  });
});
