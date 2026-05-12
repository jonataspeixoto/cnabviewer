/**
 * Web Worker para Auditoria CNAB em Segundo Plano
 * Realiza validações de campo e validações estruturais (segmentos em pares/grupos)
 */
import { cnabEngine } from './engine';

self.onmessage = (e) => {
  const { rawLines, activeRules, disabledFields } = e.data;
  console.log('[Worker] Starting audit for', rawLines.length, 'lines');
  const errors = [];
  const total = rawLines.length;
  const CHUNK_SIZE = 1000;

  // Mapa para controle de lotes e suas Formas de Lançamento
  const loteHeaders = new Map();

  for (let i = 0; i < total; i++) {
    const line = rawLines[i];
    if (!line) continue;

    const tipo = line.substring(7, 8);
    const codSegmento = line.substring(13, 14);
    const regOpcional = line.substring(17, 19); // Para J-52
    const loteNum = line.substring(3, 7);

    // Identificador completo do segmento (ex: J vs J52)
    let fullSegId = codSegmento;
    if (codSegmento === "J" && regOpcional === "52") {
      fullSegId = "J52";
    }

    // 1. Coleta Header de Lote para validações dependentes
    if (tipo === "1") {
      loteHeaders.set(loteNum, {
        formaLancamento: line.substring(11, 13),
        lineIndex: i
      });
    }

    // 2. Processamento Base (Campos individuais)
    try {
      const parsed = cnabEngine.parseLine(line, { activeRules, disabledFields, rawLines, index: i });
      const lineErrors = parsed._metadata?.errors || {};
      
      Object.entries(lineErrors).forEach(([field, message]) => {
        errors.push({
          lineIndex: i,
          fieldName: field,
          message: message,
          type: field === '_line' ? 'critical' : 'validation'
        });
      });
    } catch (err) {
      console.error("[Worker] Error parsing line", i, err);
    }

    // 3. Validações Estruturais e Retroativas
    if (tipo === "3") {
      // Validação de Segmento N sem Header
      if (codSegmento === "N") {
        const header = loteHeaders.get(loteNum);
        if (!header) {
          errors.push({
            lineIndex: i,
            fieldName: "codigo_segmento",
            message: `Segmento N órfão: Lote ${loteNum} não possui Header de Lote (Tipo 1)`,
            type: "critical"
          });
        }
      }

      /**
       * Validação de Pares Estritos (A->B, P->Q, T->U, J->J52)
       */
      const pairs = {
        "A": { target: "B", mandatory: true },
        "P": { target: "Q", mandatory: true },
        "T": { target: "U", mandatory: true },
        "J": { target: "J52", mandatory: false } // J52 é opcional em boletos, mas mandatório em PIX?
      };

      const inversePairs = {
        "B": "A",
        "Q": "P",
        "U": "T",
        "J52": "J"
      };

      // Verificação de Sucessor Imediato
      if (pairs[fullSegId]) {
        const config = pairs[fullSegId];
        const nextLine = rawLines[i + 1];
        if (nextLine) {
          const nextCod = nextLine.substring(13, 14);
          const nextRegOpc = nextLine.substring(17, 19);
          const nextFullId = (nextCod === "J" && nextRegOpc === "52") ? "J52" : nextCod;
          const nextTipo = nextLine.substring(7, 8);
          const nextLote = nextLine.substring(3, 7);

          if (config.mandatory) {
            if (nextTipo !== "3" || nextFullId !== config.target || nextLote !== loteNum) {
              errors.push({
                lineIndex: i,
                fieldName: "codigo_segmento",
                message: `Inconsistência: Segmento ${fullSegId} deve ser seguido imediatamente por um Segmento ${config.target} do mesmo lote.`,
                type: "critical"
              });
            }
          } else if (fullSegId === "J") {
            // Regra Especial para J-52 PIX (Mandatório se Forma Lançamento = 45/47)
            const header = loteHeaders.get(loteNum);
            if (header && ["45", "47"].includes(header.formaLancamento)) {
              if (nextTipo !== "3" || nextFullId !== "J52" || nextLote !== loteNum) {
                errors.push({
                  lineIndex: i,
                  fieldName: "codigo_segmento",
                  message: `Inconsistência PIX: Para pagamentos PIX (Forma 45/47), o Segmento J deve ser seguido obrigatoriamente por um J-52.`,
                  type: "critical"
                });
              }
            }
          }
        }
      }

      // Verificação de Predecessor Imediato
      if (inversePairs[fullSegId]) {
        const targetPrev = inversePairs[fullSegId];
        const prevLine = rawLines[i - 1];
        if (prevLine) {
          const prevCod = prevLine.substring(13, 14);
          const prevRegOpc = prevLine.substring(17, 19);
          const prevFullId = (prevCod === "J" && prevRegOpc === "52") ? "J52" : prevCod;
          const prevTipo = prevLine.substring(7, 8);
          const prevLote = prevLine.substring(3, 7);

          if (prevTipo !== "3" || prevFullId !== targetPrev || prevLote !== loteNum) {
            errors.push({
              lineIndex: i,
              fieldName: "codigo_segmento",
              message: `Inconsistência: Segmento ${fullSegId} deve ser precedido imediatamente por um Segmento ${targetPrev} do mesmo lote.`,
              type: "critical"
            });
          }
        }
      }
    }

    // Reportar progresso a cada chunk
    if (i % CHUNK_SIZE === 0 || i === total - 1) {
      self.postMessage({
        type: 'PROGRESS',
        progress: Math.round((i / total) * 100),
        partialErrors: i === total - 1 ? errors : null
      });
    }
  }

  self.postMessage({
    type: 'COMPLETE',
    errors: errors
  });
};
