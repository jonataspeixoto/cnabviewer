import { describe, it, expect } from 'vitest';
import { performAudit } from './audit_logic';

describe('Audit Logic', () => {
  const activeRules = {};
  const disabledFields = [];

  // Função auxiliar para criar linhas com campos em posições exatas
  const createLine = (tipo, lote = null, seq = 0, extras = {}) => {
    let line = ' '.repeat(240);
    
    // Define lote padrão baseado no tipo se não informado
    let finalLote = lote;
    if (finalLote === null) {
      if (tipo === '0') finalLote = 0;
      else if (tipo === '9') finalLote = 9999;
      else finalLote = 1;
    }

    // Lote: 4-7 (index 3-7)
    const loteStr = String(finalLote).padStart(4, '0');
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
      createLine('0'), // Lote 0000
      createLine('1', 1), // Lote 0001
      createLine('3', 1, 1), // Lote 0001
      createLine('5', 1), // Lote 0001
      createLine('9', 9999, 0, { qLotes: 1, qRegs: 5 }) // Lote 9999
    ];

    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    const structuralErrors = errors.filter(e => e.type === 'critical');
    expect(structuralErrors.length).toBe(0);
  });

  it('should detect wrong record count in Trailer de Arquivo', () => {
    const rawLines = [
      createLine('0'),
      createLine('9', 9999, 0, { qLotes: 1, qRegs: 10 }) // Espera 10, mas tem 2
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
      createLine('9')
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
    const batchError = errors.find(e => e.fieldName === 'lote_servico' && e.message.includes('pertence ao lote 0002'));
    expect(batchError).toBeDefined();
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

  it('should detect invalid batch for Header Arquivo', () => {
    const rawLines = [
      createLine('0', 1), // Header com lote 1 (ERRADO, deve ser 0)
    ];
    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    expect(errors.some(e => e.message.includes('Header de Arquivo deve ter Lote 0000'))).toBe(true);
  });

  it('should detect invalid batch for Trailer Arquivo', () => {
    const rawLines = [
      createLine('9', 1), // Trailer com lote 1 (ERRADO, deve ser 9999)
    ];
    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    expect(errors.some(e => e.message.includes('Trailer de Arquivo deve ter Lote 9999'))).toBe(true);
  });

  it('should detect missing File Header', () => {
    const rawLines = [
      createLine('1', 1),
      createLine('3', 1, 1),
      createLine('5', 1),
      createLine('9')
    ];
    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    expect(errors.some(e => e.message.includes('Header de Lote (1) fora de ordem'))).toBe(true);
  });

  it('should detect duplicate File Header', () => {
    const rawLines = [
      createLine('0'),
      createLine('0')
    ];
    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    expect(errors.some(e => e.message.includes('inesperado ou duplicado'))).toBe(true);
  });

  it('should detect duplicate File Trailer', () => {
    const rawLines = [
      createLine('0'),
      createLine('9'),
      createLine('9')
    ];
    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    expect(errors.some(e => e.message.includes('Trailer de Arquivo (9) duplicado'))).toBe(true);
  });

  it('should detect Batch without Trailer', () => {
    const rawLines = [
      createLine('0'),
      createLine('1', 1),
      createLine('3', 1, 1),
      createLine('9')
    ];
    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    expect(errors.some(e => e.message.includes('Trailer de Arquivo (9) encontrado sem fechar o lote atual'))).toBe(true);
  });

  it('should detect Batch without Header', () => {
    const rawLines = [
      createLine('0'),
      createLine('3', 1, 1),
      createLine('5', 1),
      createLine('9')
    ];
    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    expect(errors.some(e => e.message.includes('fora de um lote aberto'))).toBe(true);
    expect(errors.some(e => e.message.includes('Trailer de Lote (5) inesperado'))).toBe(true);
  });

  it('should sum Segment N values correctly', () => {
    let lineN = createLine('3', 1, 1);
    lineN = lineN.substring(0, 13) + 'N' + lineN.substring(14); // Segmento N
    const value = "000000000015000"; // 150.00
    lineN = lineN.substring(0, 135) + value + lineN.substring(150);

    let trailer5 = createLine('5', 1);
    trailer5 = trailer5.substring(0, 23) + "000000000000000000" + trailer5.substring(41); // expectedValue = 0

    const rawLines = [
      createLine('0'),
      createLine('1', 1),
      lineN,
      trailer5,
      createLine('9', 9999, 0, { qLotes: 1, qRegs: 5 })
    ];
    
    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    expect(errors.some(e => e.message.includes('soma real é 150'))).toBe(true);
  });

  it('should sum Segment O values correctly', () => {
    let lineO = createLine('3', 1, 1);
    lineO = lineO.substring(0, 13) + 'O' + lineO.substring(14); // Segmento O
    const value = "000000000025000"; // 250.00
    lineO = lineO.substring(0, 144) + value + lineO.substring(159);

    let trailer5 = createLine('5', 1);
    trailer5 = trailer5.substring(0, 23) + "000000000000000000" + trailer5.substring(41); // expectedValue = 0

    const rawLines = [
      createLine('0'),
      createLine('1', 1),
      lineO,
      trailer5,
      createLine('9', 9999, 0, { qLotes: 1, qRegs: 5 })
    ];
    
    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    expect(errors.some(e => e.message.includes('soma real é 250'))).toBe(true);
  });

  it('should reject Segment J in a TED (03) Batch', () => {
    let headerLote = createLine('1', 1);
    headerLote = headerLote.substring(0, 9) + '2003' + headerLote.substring(13); // Tipo Serviço 20, Forma 03
    
    let segmentJ = createLine('3', 1, 1);
    segmentJ = segmentJ.substring(0, 13) + 'J' + segmentJ.substring(14);

    const rawLines = [
      createLine('0'),
      headerLote,
      segmentJ,
      createLine('5', 1),
      createLine('9')
    ];

    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    expect(errors.some(e => e.message.includes("Segmento 'J' é incompatível com a Forma de Lançamento '03'"))).toBe(true);
  });

  it('should reject Segment A in a Tributo (17) Batch', () => {
    let headerLote = createLine('1', 1);
    headerLote = headerLote.substring(0, 9) + '2217' + headerLote.substring(13); // Tipo Serviço 22, Forma 17
    
    let segmentA = createLine('3', 1, 1);
    segmentA = segmentA.substring(0, 13) + 'A' + segmentA.substring(14);

    const rawLines = [
      createLine('0'),
      headerLote,
      segmentA,
      createLine('5', 1),
      createLine('9')
    ];

    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    expect(errors.some(e => e.message.includes("Segmento 'A' é incompatível com a Forma de Lançamento '17'"))).toBe(true);
  });

  it('should allow Segment P, Q, R in a Cobrança (01) Batch', () => {
    let headerLote = createLine('1', 1);
    headerLote = headerLote.substring(0, 9) + '0100' + headerLote.substring(13); // Tipo Serviço 01, Forma 00 (ignorado)
    
    let segmentP = createLine('3', 1, 1);
    segmentP = segmentP.substring(0, 13) + 'P' + segmentP.substring(14);
    
    let segmentQ = createLine('3', 1, 2);
    segmentQ = segmentQ.substring(0, 13) + 'Q' + segmentQ.substring(14);

    const rawLines = [
      createLine('0'),
      headerLote,
      segmentP,
      segmentQ,
      createLine('5', 1),
      createLine('9')
    ];

    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    // Deve passar sem erros estruturais ou de compatibilidade de segmento
    const segmentErrors = errors.filter(e => e.fieldName === 'codigo_segmento');
    expect(segmentErrors.length).toBe(0);
  });

  it('should enforce Segment B after Segment A by default (STRUC_B)', () => {
    let headerLote = createLine('1', 1);
    headerLote = headerLote.substring(0, 9) + '0101' + headerLote.substring(13); 
    
    let segmentA = createLine('3', 1, 1);
    segmentA = segmentA.substring(0, 13) + 'A' + segmentA.substring(14);
    
    // Inserindo Segmento J logo após o A (isso quebra a sequência A -> B e também incompatibilidade do lote)
    let segmentJ = createLine('3', 1, 2);
    segmentJ = segmentJ.substring(0, 13) + 'J' + segmentJ.substring(14);

    const rawLines = [
      createLine('0'),
      headerLote,
      segmentA,
      segmentJ,
      createLine('5', 1),
      createLine('9')
    ];

    const { errors } = performAudit({ rawLines, activeRules, disabledFields });
    expect(errors.some(e => e.message.includes("Segmento 'B' era esperado após o registro anterior"))).toBe(true);
  });

  it('should allow Segment A without B if STRUC_B is disabled', () => {
    let headerLote = createLine('1', 1);
    headerLote = headerLote.substring(0, 9) + '0101' + headerLote.substring(13); // Transferência normal
    
    let segmentA = createLine('3', 1, 1);
    segmentA = segmentA.substring(0, 13) + 'A' + segmentA.substring(14);

    const rawLines = [
      createLine('0'),
      headerLote,
      segmentA,
      createLine('5', 1),
      createLine('9')
    ];

    // Desativando a regra explicitamente
    const customRules = { ...activeRules, "STRUC_B": false };
    
    const { errors } = performAudit({ rawLines, activeRules: customRules, disabledFields });
    
    const structErrors = errors.filter(e => e.message.includes("Segmento 'B' era esperado"));
    expect(structErrors.length).toBe(0);
  });
});

describe('Rule Toggling System', () => {
  const activeRules = { "G002": true, "G008": true }; // Exemplos
  const disabledFields = [];

  const createLine = (tipo, lote = null, seq = 0, extras = {}) => {
    let line = ' '.repeat(240);
    // Banco
    line = '341' + line.substring(3);
    // Lote
    if (lote !== null) line = line.substring(0, 3) + String(lote).padStart(4, '0') + line.substring(7);
    // Tipo
    line = line.substring(0, 7) + tipo + line.substring(8);
    // Sequencia
    if (tipo !== '0' && tipo !== '9') {
      line = line.substring(0, 8) + String(seq).padStart(5, '0') + line.substring(13);
    }
    return line;
  };

  it('should trigger a validation error for a field rule (e.g. P001 - Câmara) by default', () => {
    let segmentA = createLine('3', 1, 1);
    segmentA = segmentA.substring(0, 13) + 'A' + segmentA.substring(14);
    // Câmara Centralizadora (Pos 18-20) - Regra P001 (Values: 018, 700, 009)
    segmentA = segmentA.substring(0, 17) + '999' + segmentA.substring(20);

    const rawLines = [
      createLine('0'),
      createLine('1', 1),
      segmentA,
      createLine('5', 1),
      createLine('9')
    ];

    const { errors } = performAudit({ rawLines, activeRules: {}, disabledFields: [] });
    // P001 deve gerar erro
    const camaraErrors = errors.filter(e => e.fieldName === 'codigo_camara');
    expect(camaraErrors.length).toBeGreaterThan(0);
  });

  it('should NOT trigger a validation error when the field rule (P001) is toggled off', () => {
    let segmentA = createLine('3', 1, 1);
    segmentA = segmentA.substring(0, 13) + 'A' + segmentA.substring(14);
    // Câmara Centralizadora (Pos 18-20) 
    segmentA = segmentA.substring(0, 17) + '999' + segmentA.substring(20);

    const rawLines = [
      createLine('0'),
      createLine('1', 1),
      segmentA,
      createLine('5', 1),
      createLine('9')
    ];

    // Desligando a Regra P001
    const customRules = { "P001": false };
    
    const { errors } = performAudit({ rawLines, activeRules: customRules, disabledFields: [] });
    const camaraErrors = errors.filter(e => e.fieldName === 'codigo_camara');
    expect(camaraErrors.length).toBe(0);
  });

  it('should NOT trigger a validation error when the specific FIELD is ignored via disabledFields', () => {
    let segmentA = createLine('3', 1, 1);
    segmentA = segmentA.substring(0, 13) + 'A' + segmentA.substring(14);
    segmentA = segmentA.substring(0, 17) + '999' + segmentA.substring(20);

    const rawLines = [
      createLine('0'),
      createLine('1', 1),
      segmentA,
      createLine('5', 1),
      createLine('9')
    ];

    const customDisabledFields = ['segmento_a:codigo_camara'];
    
    const { errors } = performAudit({ rawLines, activeRules: {}, disabledFields: customDisabledFields });
    const camaraErrors = errors.filter(e => e.fieldName === 'codigo_camara');
    expect(camaraErrors.length).toBe(0);
  });

  it('should trigger warning when batch is out of sequence (G002) by default', () => {
    let headerLote = createLine('1', 2); // Esperado 1, achou 2

    const rawLines = [
      createLine('0'),
      headerLote,
      createLine('5', 2),
      createLine('9')
    ];

    const { errors } = performAudit({ rawLines, activeRules: {}, disabledFields: [] });
    const sequenceErrors = errors.filter(e => e.fieldName === 'lote_servico' && e.message.includes('Lote fora de sequência'));
    expect(sequenceErrors.length).toBeGreaterThan(0);
  });

  it('should NOT trigger warning when G002 is toggled off and batch is out of sequence', () => {
    let headerLote = createLine('1', 2); // Esperado 1, achou 2

    const rawLines = [
      createLine('0'),
      headerLote,
      createLine('5', 2),
      createLine('9')
    ];

    const customRules = { "G002": false };
    const { errors } = performAudit({ rawLines, activeRules: customRules, disabledFields: [] });
    const sequenceErrors = errors.filter(e => e.fieldName === 'lote_servico' && e.message.includes('Lote fora de sequência'));
    expect(sequenceErrors.length).toBe(0);
  });
});


