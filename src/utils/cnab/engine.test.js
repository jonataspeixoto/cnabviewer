import { describe, it, expect } from 'vitest';
import { cnabEngine } from './engine';

describe('cnabEngine', () => {
  describe('getSchema', () => {
    it('should identify Header de Arquivo (tipo 0)', () => {
      const line = ' '.repeat(7) + '0' + ' '.repeat(232);
      const schema = cnabEngine.getSchema(line);
      expect(schema.id).toBe('header_arquivo');
    });

    it('should identify Trailer de Arquivo (tipo 9)', () => {
      const line = ' '.repeat(7) + '9' + ' '.repeat(232);
      const schema = cnabEngine.getSchema(line);
      expect(schema.id).toBe('trailer_arquivo');
    });

    it('should identify Header de Lote (tipo 1)', () => {
      const line = ' '.repeat(7) + '1' + ' '.repeat(232);
      const schema = cnabEngine.getSchema(line);
      expect(schema.id).toBe('header_lote_pagamento');
    });

    it('should identify Segmento A (tipo 3, cod A)', () => {
      const line = ' '.repeat(7) + '3' + ' '.repeat(5) + 'A' + ' '.repeat(226);
      const schema = cnabEngine.getSchema(line);
      expect(schema.id).toBe('segmento_a');
    });

    it('should return null for unknown record types', () => {
      const line = ' '.repeat(7) + 'X' + ' '.repeat(232);
      const schema = cnabEngine.getSchema(line);
      expect(schema).toBeNull();
    });
  });

  describe('parseLine', () => {
    it('should extract field values correctly', () => {
      // Header Arquivo: Banco pos 1-3, Empresa Tipo Inscricao pos 18-18, Tipo Registro pos 8 = '0'
      const line = '756' + ' '.repeat(4) + '0' + ' '.repeat(9) + '1' + ' '.repeat(222);
      const parsed = cnabEngine.parseLine(line);
      
      expect(parsed.codigo_banco).toBe('756');
      expect(parsed.empresa_inscricao_tipo).toBe('1');
    });

    it('should report error for wrong line length', () => {
      const line = '123';
      const parsed = cnabEngine.parseLine(line);
      expect(parsed._metadata.errors._line).toBeDefined();
    });

    it('should report numeric validation errors', () => {
      // Header: Banco deve ser N. Pos 8 deve ser '0' para ser Header.
      const line = 'ABC' + ' '.repeat(4) + '0' + ' '.repeat(232);
      const parsed = cnabEngine.parseLine(line);
      expect(parsed.codigo_banco).toBe('ABC');
      expect(parsed._metadata.errors.codigo_banco).toContain('numérico');
    });

    it('should report error for accents in strict Alphanumeric fields', () => {
      // Nome Favorecido (Segmento A, G013, Pos 44-73) is type A (Strict)
      const line = '0010001300001A00000000000000000000000000000' + 'JONATÁS' + ' '.repeat(166);
      const parsed = cnabEngine.parseLine(line);
      expect(parsed._metadata.errors.nome_favorecido).toContain('não permite acentos');
    });

    it('should allow symbols in Special Alphanumeric fields (G102)', () => {
      // Segmento B (PIX): Chave Pix (G102, Pos 128-226) is Special Type A
      const line = '0010001300001B' + ' '.repeat(113) + 'test@example.com' + ' '.repeat(111);
      const parsed = cnabEngine.parseLine(line);
      // Deve ser capturado corretamente e não ter erro de tipo A (embora G102 valide depois)
      expect(parsed._metadata.errors.chave_pix).toBeUndefined();
    });

    it('should report error for symbols in strict Alphanumeric fields', () => {
      // Seu Número (Segmento A, G064, Pos 74-93) is type A (Strict)
      const line = '0010001300001A00000000000000000000000000000' + ' '.repeat(30) + 'DOC@123' + ' '.repeat(146);
      const parsed = cnabEngine.parseLine(line);
      expect(parsed._metadata.errors.seu_numero).toContain('apenas letras, números e espaços');
    });
  });

  describe('getLoteNumber', () => {
    it('should extract lote from pos 4-7', () => {
      const line = '0000001' + ' '.repeat(233); // 000 em 1-3, 0001 em 4-7
      expect(cnabEngine.getLoteNumber(line)).toBe('0001');
    });
  });
});
