import { cnabEngine } from './engine';
import { isSegmentAllowed } from './cnab_rules_matrix';


/**
 * Lógica central de auditoria CNAB
 * Separada do Worker para permitir testes unitários
 */
export function performAudit({ rawLines, activeRules, disabledFields }) {
  const errors = [];
  const total = rawLines.length;
  
  const loteHeaders = new Map();
  const loteStats = new Map(); // { actualCount: 0, actualValue: 0, lastSeq: 0 }
  const STATES = {
    EXPECTING_FILE_HEADER: 'EXPECTING_FILE_HEADER',
    EXPECTING_BATCH_OR_FILE_TRAILER: 'EXPECTING_BATCH_OR_FILE_TRAILER',
    INSIDE_BATCH: 'INSIDE_BATCH',
    FINISHED: 'FINISHED'
  };
  let currentState = STATES.EXPECTING_FILE_HEADER;

  let totalLotesCount = 0;
  let totalRecordsCount = 0;
  let currentLoteNum = null;
  let currentHeaderLoteLine = null;
  let expectedSegment = null;

  for (let i = 0; i < total; i++) {
    const line = rawLines[i];
    if (!line) continue;

    totalRecordsCount++;
    const tipo = line.substring(7, 8);
    const codSegmento = line.substring(13, 14);
    const regOpcional = line.substring(17, 19); 
    const loteNum = parseInt(line.substring(3, 7));
    
    // --- MÁQUINA DE ESTADOS (ORDEM) ---
    if (tipo === "0") {
      if (currentState !== STATES.EXPECTING_FILE_HEADER) {
        errors.push({ lineIndex: i, fieldName: "tipo_registro", message: "Header de Arquivo (0) inesperado ou duplicado.", type: "critical" });
      } else {
        currentState = STATES.EXPECTING_BATCH_OR_FILE_TRAILER;
      }
    } else if (tipo === "1") {
      if (currentState === STATES.INSIDE_BATCH) {
        errors.push({ lineIndex: i, fieldName: "tipo_registro", message: "Header de Lote (1) sem que o lote anterior tenha sido fechado (falta Trailer 5).", type: "critical" });
      } else if (currentState !== STATES.EXPECTING_BATCH_OR_FILE_TRAILER) {
        errors.push({ lineIndex: i, fieldName: "tipo_registro", message: "Header de Lote (1) fora de ordem.", type: "critical" });
      }
      currentState = STATES.INSIDE_BATCH;
    } else if (["2", "3", "4"].includes(tipo)) {
      if (currentState !== STATES.INSIDE_BATCH) {
        errors.push({ lineIndex: i, fieldName: "tipo_registro", message: `Registro de Detalhe (${tipo}) encontrado fora de um lote aberto.`, type: "critical" });
      }
    } else if (tipo === "5") {
      if (currentState !== STATES.INSIDE_BATCH) {
        errors.push({ lineIndex: i, fieldName: "tipo_registro", message: "Trailer de Lote (5) inesperado (nenhum lote aberto).", type: "critical" });
      } else {
        if (expectedSegment && activeRules["STRUC_B"] !== false) {
          errors.push({ lineIndex: i, fieldName: "codigo_segmento", message: `Segmento '${expectedSegment}' era esperado antes do fechamento do lote.`, type: "critical" });
        }
        currentState = STATES.EXPECTING_BATCH_OR_FILE_TRAILER;
      }
    } else if (tipo === "9") {
      if (currentState === STATES.INSIDE_BATCH) {
        errors.push({ lineIndex: i, fieldName: "tipo_registro", message: "Trailer de Arquivo (9) encontrado sem fechar o lote atual.", type: "critical" });
      } else if (currentState === STATES.EXPECTING_FILE_HEADER) {
        errors.push({ lineIndex: i, fieldName: "tipo_registro", message: "Trailer de Arquivo (9) encontrado sem Header de Arquivo (0).", type: "critical" });
      } else if (currentState === STATES.FINISHED) {
        errors.push({ lineIndex: i, fieldName: "tipo_registro", message: "Trailer de Arquivo (9) duplicado.", type: "critical" });
      } else {
        currentState = STATES.FINISHED;
      }
    }

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

      const tipoServico = line.substring(9, 11);
      const formaLancamento = line.substring(11, 13);

      loteHeaders.set(loteNum, { lineIndex: i });
      loteStats.set(loteNum, {
        actualCount: 1,
        actualValue: 0,
        lastSeq: 0,
        tipoServico,
        formaLancamento
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
        
        // --- Validação de Sequência A -> B ---
        if (expectedSegment && activeRules["STRUC_B"] !== false) {
           if (codSegmento !== expectedSegment) {
             errors.push({
               lineIndex: i,
               fieldName: "codigo_segmento",
               message: `Segmento '${expectedSegment}' era esperado após o registro anterior, mas encontrado '${codSegmento}'.`,
               type: "critical"
             });
           }
        }
        
        expectedSegment = null; // Reseta a expectativa
        if (codSegmento === "A") {
           expectedSegment = "B";
        }
        // -------------------------------------

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

        // Validar cruzamento de contexto (Forma de Lançamento vs Segmento Permitido)
        if (!isSegmentAllowed(codSegmento, stats.formaLancamento, stats.tipoServico)) {
          errors.push({
            lineIndex: i,
            fieldName: "codigo_segmento",
            message: `Segmento '${codSegmento}' é incompatível com a Forma de Lançamento '${stats.formaLancamento}' ou Serviço '${stats.tipoServico}' declarada no Header do Lote.`,
            type: "critical"
          });
        }

        // Acumular valores (Adicionado suporte a Segmentos N e O)
        let valStr = "";
        if (codSegmento === "A") valStr = line.substring(119, 134);
        else if (codSegmento === "J" && regOpcional !== "52") valStr = line.substring(152, 167);
        else if (codSegmento === "P") valStr = line.substring(85, 100);
        else if (codSegmento === "N") valStr = line.substring(135, 150); // Valor do Pagamento do Tributo
        else if (codSegmento === "O") valStr = line.substring(144, 159); // Valor do Pagamento da Conta

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

  // --- VALIDAÇÃO DE FIM DE ARQUIVO ---
  if (currentState === STATES.EXPECTING_FILE_HEADER && total > 0) {
    errors.push({ lineIndex: total - 1, fieldName: "estrutura", message: "Arquivo sem Header de Arquivo (0).", type: "critical" });
  } else if (currentState === STATES.INSIDE_BATCH) {
    errors.push({ lineIndex: total - 1, fieldName: "estrutura", message: "Fim inesperado: Um lote está aberto e não foi fechado (falta Trailer 5).", type: "critical" });
  } else if (currentState === STATES.EXPECTING_BATCH_OR_FILE_TRAILER) {
    errors.push({ lineIndex: total - 1, fieldName: "estrutura", message: "Fim inesperado: Arquivo aberto não foi fechado (falta Trailer 9).", type: "critical" });
  }

  // Agrupa erros por linha para performance
  const errorsByLine = {};
  errors.forEach(err => {
    if (!errorsByLine[err.lineIndex]) errorsByLine[err.lineIndex] = [];
    errorsByLine[err.lineIndex].push(err);
  });

  return { errors, errorsByLine };
}
