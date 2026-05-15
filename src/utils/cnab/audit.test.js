import { describe, it, expect } from 'vitest';
import { performAudit } from './audit_logic';

describe('Audit Logic', () => {
  const activeRules = {};
  const disabledFields = {};

  // Função auxiliar para criar linhas com campos em posições exatas
  const createLine = (tipo, lote = 1, seq = 0, extras = {}) => {
    let line = ' '.repeat(240);
    // Lote: 4-7 (index 3-7)
    const loteStr = String(lote).padStart(4, '0');
    line = line.substring(0, 3) + loteStr + line.substring(7);
    // Tipo: 8 (index 7)
    line = line.substring(0, 7) + tipo + line.substring(8);
    
    if (tipo === '3') {
      // Seq: 9-13 (index 8-13)
      const seqStr = String(seq).padStart(5, '0');
      line = line.substring(0, 8) + seqStr + line.substring(13);
    }

    if (tipo === '9') {
      // Qnt Lotes: 18-23 (index 17-23)
      const qLotes = String(extras.qLotes || 0).padStart(6, '0');
      line = line.substring(0, 17) + qLotes + line.substring(23);
      // Qnt Regs: 24-29 (index 23-29)
      const qRegs = String(extras.qRegs || 0).padStart(6, '0');
      line = line.substring(0, 23) + qRegs + line.substring(29);
    }

    return line;
  };

  it('should validate correct record counts in Trailer de Arquivo', () => {
    const rawLines = [
      createLine('0'), // 1
      createLine('1', 1), // 2
      createLine('3', 1, 1), // 3
      createLine('5', 1), // 4
      createLine('9', 0, 0, { qLotes: 1, qRegs: 5 }) // 5
    ];

    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    const structuralErrors = errors.filter(e => e.type === 'critical');
    expect(structuralErrors.length).toBe(0);
  });

  it('should detect wrong record count in Trailer de Arquivo', () => {
    const rawLines = [
      createLine('0'),
      createLine('9', 0, 0, { qLotes: 1, qRegs: 10 }) // Espera 10, mas tem 2
    ];

    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    expect(errors.some(e => e.message.includes('Quantidade total de registros divergente'))).toBe(true);
  });

  it('should validate numeric batch numbers (0001 vs 1)', () => {
    const rawLines = [
      createLine('0'),
      createLine('1', 1),
      createLine('3', 1, 1),
      createLine('5', 1),
    ];

    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    const loteErrors = errors.filter(e => e.fieldName === 'lote_servico');
    expect(loteErrors.length).toBe(0);
  });

  it('should detect movement in wrong batch', () => {
    const rawLines = [
      createLine('0'),
      createLine('1', 1),
      createLine('3', 2, 1), // Detalhe Lote 2 dentro do Lote 1
      createLine('5', 1),
    ];

    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    const batchError = errors.find(e => e.fieldName === 'lote_servico' && e.type === 'critical');
    expect(batchError).toBeDefined();
    expect(batchError.message).toContain('pertence ao lote 0002, mas está posicionado fisicamente dentro do lote 0001');
  });

  it('should detect sequence errors in batch records', () => {
    const rawLines = [
      createLine('0'),
      createLine('1', 1),
      createLine('3', 1, 1), // Seq 1
      createLine('3', 1, 3), // Seq 3 (Pulou o 2!)
    ];

    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    const seqError = errors.find(e => e.fieldName === 'numero_sequencial');
    expect(seqError).toBeDefined();
    expect(seqError.message).toContain('Esperado: 2, Encontrado: 3');
  });
});
