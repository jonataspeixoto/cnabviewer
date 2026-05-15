import { cnabEngine } from './engine';

/**
 * Lógica central de auditoria CNAB
 * Separada do Worker para permitir testes unitários
 */
export function performAudit({ rawLines, activeRules, disabledFields }) {
  const errors = [];
  const total = rawLines.length;
  
  const loteHeaders = new Map();
  const loteStats = new Map(); // { actualCount: 0, actualValue: 0, lastSeq: 0 }
  let totalLotesCount = 0;
  let totalRecordsCount = 0;
  let currentLoteNum = null;
  let currentHeaderLoteLine = null;

  for (let i = 0; i < total; i++) {
    const line = rawLines[i];
    if (!line) continue;

    totalRecordsCount++;
    const tipo = line.substring(7, 8);
    const codSegmento = line.substring(13, 14);
    const regOpcional = line.substring(17, 19); 
    const loteNum = parseInt(line.substring(3, 7));
    
    // --- VALIDAÇÃO DE LOTES FIXOS (0000 e 9999) ---
    if (tipo === "0" && loteNum !== 0) {
      errors.push({
        lineIndex: i,
        fieldName: "lote_servico",
        message: `Header de Arquivo deve ter Lote 0000. Encontrado: ${String(loteNum).padStart(4, '0')}`,
        type: "critical"
      });
    }
    if (tipo === "9" && loteNum !== 9999) {
      errors.push({
        lineIndex: i,
        fieldName: "lote_servico",
        message: `Trailer de Arquivo deve ter Lote 9999. Encontrado: ${String(loteNum).padStart(4, '0')}`,
        type: "critical"
      });
    }
    
    // --- VALIDAÇÕES DE LOTE E ESTRUTURA ---

    if (tipo === "1") {
      totalLotesCount++;
      currentLoteNum = loteNum;
      currentHeaderLoteLine = line;
      
      if (!isNaN(loteNum) && loteNum !== totalLotesCount && loteNum !== 0) {
        errors.push({
          lineIndex: i,
          fieldName: "lote_servico",
          message: `Lote fora de sequência. Esperado: ${String(totalLotesCount).padStart(4, '0')}, Encontrado: ${String(loteNum).padStart(4, '0')}`,
          type: "warning"
        });
      }

      loteHeaders.set(loteNum, { lineIndex: i });
      loteStats.set(loteNum, {
        actualCount: 1,
        actualValue: 0,
        lastSeq: 0
      });
    }

    if (tipo === "3") {
      const stats = loteStats.get(loteNum);
      // Validar se o movimento pertence ao lote atual (Comparação numérica segura e ignora NaN)
      if (!isNaN(loteNum) && currentLoteNum !== null && !isNaN(currentLoteNum) && loteNum !== currentLoteNum) {
          errors.push({
          lineIndex: i,
          fieldName: "lote_servico",
          message: `Movimento pertence ao lote ${String(loteNum).padStart(4, '0')}, mas está posicionado fisicamente dentro do lote ${String(currentLoteNum).padStart(4, '0')}`,
          type: "critical"
        });
      }

      if (stats) {
        stats.actualCount++;
        const seqNum = parseInt(line.substring(8, 13));
        if (!isNaN(seqNum)) {
          if (stats.lastSeq !== 0 && seqNum !== stats.lastSeq + 1) {
            errors.push({
              lineIndex: i,
              fieldName: "numero_sequencial",
              message: `Sequencial de registro inválido. Esperado: ${stats.lastSeq + 1}, Encontrado: ${seqNum}`,
              type: "warning"
            });
          }
          stats.lastSeq = seqNum;
        }

        // Acumular valores
        let valStr = "";
        if (codSegmento === "A") valStr = line.substring(119, 134);
        else if (codSegmento === "J" && regOpcional !== "52") valStr = line.substring(152, 167);
        else if (codSegmento === "P") valStr = line.substring(85, 100);

        if (valStr && /^\d+$/.test(valStr)) {
          stats.actualValue += parseInt(valStr);
        }
      }
    }

    if (tipo === "5") {
      const stats = loteStats.get(loteNum);
      if (stats) {
        stats.actualCount++;
        const expectedCount = parseInt(line.substring(17, 23));
        if (!isNaN(expectedCount) && expectedCount !== stats.actualCount) {
          errors.push({
            lineIndex: i,
            fieldName: "quantidade_registros",
            message: `Quantidade de registros no lote divergente. Trailer diz ${expectedCount}, mas foram encontrados ${stats.actualCount}`,
            type: "critical"
          });
        }

        const expectedValue = parseInt(line.substring(23, 41));
        if (!isNaN(expectedValue) && expectedValue !== stats.actualValue) {
          errors.push({
            lineIndex: i,
            fieldName: "somatoria_valores",
            message: `Somatório de valores do lote divergente. Trailer diz ${expectedValue / 100}, mas a soma real é ${stats.actualValue / 100}`,
            type: "critical"
          });
        }
      }
    }

    if (tipo === "9") {
      const expectedLotes = parseInt(line.substring(17, 23));
      if (!isNaN(expectedLotes) && expectedLotes !== totalLotesCount) {
        errors.push({
          lineIndex: i,
          fieldName: "quantidade_lotes",
          message: `Quantidade de lotes do arquivo divergente. Trailer diz ${expectedLotes}, mas foram encontrados ${totalLotesCount}`,
          type: "critical"
        });
      }

      const expectedTotalRecords = parseInt(line.substring(23, 29));
      if (!isNaN(expectedTotalRecords) && expectedTotalRecords !== totalRecordsCount) {
        errors.push({
          lineIndex: i,
          fieldName: "quantidade_registros",
          message: `Quantidade total de registros divergente. Trailer diz ${expectedTotalRecords}, mas foram encontrados ${totalRecordsCount}`,
          type: "critical"
        });
      }
    }

    if (line.length > 240) {
      errors.push({
        lineIndex: i,
        fieldName: "_extra",
        message: `Linha com excesso de caracteres (${line.length} posições).`,
        type: "critical"
      });
    }

    // Validações de campo via engine
    try {
      const parsed = cnabEngine.parseLine(line, { 
        activeRules, 
        disabledFields, 
        rawLines, 
        index: i,
        currentHeaderLote: currentHeaderLoteLine 
      });
      Object.entries(parsed._metadata?.errors || {}).forEach(([field, message]) => {
        errors.push({ lineIndex: i, fieldName: field, message, type: 'validation' });
      });
    } catch (e) {}
  }

  // Agrupa erros por linha para performance
  const errorsByLine = {};
  errors.forEach(err => {
    if (!errorsByLine[err.lineIndex]) errorsByLine[err.lineIndex] = [];
    errorsByLine[err.lineIndex].push(err);
  });

  return { errors, errorsByLine };
}
