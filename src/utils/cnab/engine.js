import { CNAB_SCHEMAS, CNAB_SEGMENTO_N_SUB_TYPES, CNAB_SEGMENTO_J52_SUB_TYPES } from './schemas';
import { CNAB_RULES } from './rules';

export const cnabEngine = {
  /**
   * Identifica qual schema usar para uma linha bruta
   */
  getSchema: (line, rawLines = [], index = -1) => {
    if (!line || typeof line !== "string") return null;
    const tipo = line.substring(7, 8);
    const codSegmento = line.substring(13, 14);
    
    if (tipo === "0") return CNAB_SCHEMAS.header_arquivo;
    if (tipo === "9") return CNAB_SCHEMAS.trailer_arquivo;
    if (tipo === "1") return CNAB_SCHEMAS.header_lote_pagamento;
    if (tipo === "5") return CNAB_SCHEMAS.trailer_lote_pagamento;
    
    if (tipo === "3") {
      // Segmento J-52 (Dinâmico: Boleto vs PIX)
      if (codSegmento === "J" && line.substring(17, 19) === "52") {
        const baseSchema = CNAB_SCHEMAS.segmento_j52;
        let subType = null;
        
        if (rawLines.length > 0 && index >= 0) {
          const currentLote = line.substring(3, 7);
          for (let i = index; i >= 0; i--) {
            const l = rawLines[i];
            if (l.substring(3, 7) === currentLote && l.substring(7, 8) === "1") {
              const formaLancamento = l.substring(11, 13);
              // 45, 47 = PIX
              if (["45", "47"].includes(formaLancamento)) subType = CNAB_SEGMENTO_J52_SUB_TYPES.pix;
              break;
            }
          }
        }
        
        if (subType) {
          const fields = [...baseSchema.fields];
          // Substitui todos os campos de identificação (a partir da pos 20) pelo sub-layout PIX
          const startIdx = fields.findIndex(f => f.start >= 20);
          if (startIdx !== -1) {
            fields.splice(startIdx, fields.length - startIdx, ...subType);
          }
          return { ...baseSchema, fields };
        }
        return baseSchema;
      }
      
      if (codSegmento === 'N') {
        let subType = null;
        
        // Se temos as linhas do arquivo, buscamos o Header do Lote atual
        if (rawLines.length > 0 && index >= 0) {
          const currentLote = line.substring(3, 7);
          // Busca o Header do Lote (tipo 1) para este lote específico
          for (let i = index; i >= 0; i--) {
            const l = rawLines[i];
            if (l.substring(3, 7) === currentLote && l.substring(7, 8) === "1") {
              const formaLancamento = l.substring(11, 13);
              if (formaLancamento === "17") subType = CNAB_SEGMENTO_N_SUB_TYPES.gps;
              else if (formaLancamento === "16") subType = CNAB_SEGMENTO_N_SUB_TYPES.darf_comum;
              else if (formaLancamento === "18") subType = CNAB_SEGMENTO_N_SUB_TYPES.darf_simples;
              else if (["25", "26", "27"].includes(formaLancamento)) subType = CNAB_SEGMENTO_N_SUB_TYPES.veiculos_estaduais;
              break;
            }
          }
        }

        const baseSchema = CNAB_SCHEMAS.segmento_n;
        if (subType) {
          // Composição dinâmica: substitui o campo 'informacoes_complementares' pelos sub-campos
          const fields = [...baseSchema.fields];
          const infoIdx = fields.findIndex(f => f.name === "informacoes_complementares");
          if (infoIdx !== -1) {
            fields.splice(infoIdx, 1, ...subType);
          }
          return { ...baseSchema, fields };
        }
        
        return baseSchema;
      }

      const segMap = {
        "A": CNAB_SCHEMAS.segmento_a,
        "B": CNAB_SCHEMAS.segmento_b,
        "J": CNAB_SCHEMAS.segmento_j,
        "P": CNAB_SCHEMAS.segmento_p,
        "Q": CNAB_SCHEMAS.segmento_q,
        "R": CNAB_SCHEMAS.segmento_r,
        "T": CNAB_SCHEMAS.segmento_t,
        "U": CNAB_SCHEMAS.segmento_u,
        "S": CNAB_SCHEMAS.segmento_s
      };
      return segMap[codSegmento] || null;
    }
    return null;
  },

  /**
   * Transforma linha bruta em Objeto JSON com metadados de erro
   */
  parseLine: (line, context = {}) => {
    const { activeRules = {}, disabledFields = [] } = context;
    if (!line || typeof line !== "string") return { _metadata: { raw: "", errors: {} } };
    const schema = cnabEngine.getSchema(line, context.rawLines, context.index);
    const result = { _metadata: { raw: line, errors: {}, lote: cnabEngine.getLoteNumber(line) } };
    
    // Validação de Tamanho
    if (line.length !== 240) {
      result._metadata.errors._line = `Tamanho inválido: ${line.length} (esperado 240)`;
    }

    if (!schema) return result;

    schema.fields.forEach(field => {
      const val = line.substring(field.start - 1, field.end);
      result[field.name] = val;
    });

    // Segunda passada: Validação com contexto total da linha
    schema.fields.forEach(field => {
      const fieldId = `${schema.id}:${field.name}`;
      const isDisabled = disabledFields.includes(fieldId);
      const ruleName = field.rule || field.ruleId;

      if (!isDisabled && ruleName && CNAB_RULES[ruleName] && activeRules[ruleName] !== false) {
        const error = CNAB_RULES[ruleName].validate(result[field.name], result);
        if (error !== true) {
          result._metadata.errors[field.name] = error;
        }
      }
    });

    return result;
  },

  /**
   * Transforma JSON em string de 240 caracteres
   */
  generateLine: (data, schema) => {
    if (data._raw !== undefined) {
      return data._raw; // Retorna exatamente o que foi digitado no modo raw
    }
    
    if (!schema) return data._raw || "";

    // Tentamos reconstruir a linha baseada nos campos
    let lineArr = [];
    schema.fields.forEach(field => {
      let val = data[field.name] !== undefined ? String(data[field.name]) : (field.default || "");
      const size = field.end - field.start + 1;
      
      // Ajuste de tamanho por campo (opcional, mas mantemos para integridade dos campos individuais)
      if (field.type === "N") {
        val = val.padStart(size, "0").substring(0, size);
      } else {
        val = val.padEnd(size, " ").substring(0, size);
      }
      lineArr.push(val);
    });

    return lineArr.join("");
  },

  getLoteNumber: (line) => {
    if (!line || line.length < 7) return "0000";
    return line.substring(3, 7);
  }
};
