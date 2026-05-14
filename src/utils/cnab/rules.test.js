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
      expect(rule.validate('sp')).toBe(true); // case-insensitive because of .toUpperCase() in implementation
      expect(rule.validate(' RJ ')).toBe(true);
    });
    it('should fail for invalid UFs', () => {
      expect(rule.validate('XX')).toBe('UF inexistente');
    });
  });

  describe('G006 (Número de Inscrição - dynamicTaxId)', () => {
    const rule = CNAB_RULES['G006'];
    it('should validate valid CPF', () => {
      // Usando um CPF válido (gerado/exemplo)
      expect(rule.validate('12345678909')).toBe(true);
    });
    it('should fail for invalid CPF', () => {
      expect(rule.validate('11111111111')).toBe('CPF Inválido');
    });
    it('should validate valid CNPJ', () => {
      // CNPJ da Google Brasil (exemplo): 06.990.590/0001-23
      expect(rule.validate('06990590000123')).toBe(true);
      // CNPJ em campo de 15 posições (prefixado com 0)
      expect(rule.validate('006990590000123')).toBe(true);
    });
    it('should fail for invalid CNPJ', () => {
      expect(rule.validate('06990590000100')).toBe('CNPJ Inválido (incluindo Alfanumérico)');
    });
  });
});
