import { CNAB_SCHEMAS } from './schemas';
import { CNAB_RULES } from './rules';

export const cnabEngine = {
  /**
   * Identifica qual schema usar para uma linha bruta
   */
  getSchema: (line) => {
    if (!line || typeof line !== "string") return null;
    const tipo = line.substring(7, 8);
    const codSegmento = line.substring(13, 14);
    
    if (tipo === "0") return CNAB_SCHEMAS.header_arquivo;
    if (tipo === "9") return CNAB_SCHEMAS.trailer_arquivo;
    if (tipo === "1") return CNAB_SCHEMAS.header_lote;
    if (tipo === "5") return CNAB_SCHEMAS.trailer_lote;
    
    if (tipo === "3") {
      if (codSegmento === "J" && line.substring(17, 19) === "52") {
        return CNAB_SCHEMAS.segmento_j52;
      }
      
      const segMap = {
        "A": CNAB_SCHEMAS.segmento_a,
        "B": CNAB_SCHEMAS.segmento_b,
        "J": CNAB_SCHEMAS.segmento_j,
        "P": CNAB_SCHEMAS.segmento_p,
        "Q": CNAB_SCHEMAS.segmento_q,
        "R": CNAB_SCHEMAS.segmento_r,
        "T": CNAB_SCHEMAS.segmento_t,
        "U": CNAB_SCHEMAS.segmento_u
      };
      return segMap[codSegmento] || null;
    }
    return null;
  },

  /**
   * Transforma linha bruta em Objeto JSON com metadados de erro
   */
  parseLine: (line, activeRules = {}) => {
    if (!line || typeof line !== "string") return { _metadata: { raw: "", errors: {} } };
    const schema = cnabEngine.getSchema(line);
    const result = { _metadata: { raw: line, errors: {}, lote: cnabEngine.getLoteNumber(line) } };
    
    // Validação de Tamanho
    if (line.length !== 240) {
      result._metadata.errors._line = `Tamanho inválido: ${line.length} (esperado 240)`;
    }

    if (!schema) return result;

    schema.fields.forEach(field => {
      const val = line.substring(field.start - 1, field.end);
      result[field.name] = val;

      if (field.rule && activeRules[field.rule]) {
        const error = CNAB_RULES[field.rule](val);
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
