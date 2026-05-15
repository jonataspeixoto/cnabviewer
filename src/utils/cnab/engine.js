import { CNAB_SCHEMAS, CNAB_SEGMENTO_N_SUB_TYPES, CNAB_SEGMENTO_J52_SUB_TYPES, CNAB_SEGMENTO_B_SUB_TYPES } from './schemas.js';
import { CNAB_RULES } from './rules.js';

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
        let subSchemaLabel = "Boleto";
        
        if (rawLines.length > 0 && index >= 0) {
          const currentLote = line.substring(3, 7);
          for (let i = index; i >= 0; i--) {
            const l = rawLines[i];
            if (l.substring(3, 7) === currentLote && l.substring(7, 8) === "1") {
              const formaLancamento = l.substring(11, 13);
              // 45, 47 = PIX
              if (["45", "47"].includes(formaLancamento)) {
                subType = CNAB_SEGMENTO_J52_SUB_TYPES.pix;
                subSchemaLabel = "PIX";
              }
              break;
            }
          }
        }
        
        if (subType) {
          const fields = [...baseSchema.fields];
          // Substitui todos os campos de identificação (a partir da pos 20) pelo sub-layout PIX
          const startIdx = fields.findIndex(f => f.start >= 20);
          if (startIdx !== -1) {
            const dynamicFields = subType.map(f => ({ ...f, isDynamic: true }));
            fields.splice(startIdx, fields.length - startIdx, ...dynamicFields);
          }
          return { ...baseSchema, fields, subSchemaLabel };
        }
        return { ...baseSchema, subSchemaLabel };
      }
      
      if (codSegmento === 'N') {
        let subType = null;
        let subSchemaLabel = "Padrão";
        
        // Se temos as linhas do arquivo, buscamos o Header do Lote atual
        if (rawLines.length > 0 && index >= 0) {
          const currentLote = line.substring(3, 7);
          // Busca o Header do Lote (tipo 1) para este lote específico
          for (let i = index; i >= 0; i--) {
            const l = rawLines[i];
            if (l.substring(3, 7) === currentLote && l.substring(7, 8) === "1") {
              const formaLancamento = l.substring(11, 13);
              if (formaLancamento === "17") { subType = CNAB_SEGMENTO_N_SUB_TYPES.gps; subSchemaLabel = "GPS"; }
              else if (formaLancamento === "16") { subType = CNAB_SEGMENTO_N_SUB_TYPES.darf_comum; subSchemaLabel = "DARF Comum"; }
              else if (formaLancamento === "18") { subType = CNAB_SEGMENTO_N_SUB_TYPES.darf_simples; subSchemaLabel = "DARF Simples"; }
              else if (["25", "26", "27"].includes(formaLancamento)) { subType = CNAB_SEGMENTO_N_SUB_TYPES.veiculos_estaduais; subSchemaLabel = "Veículos"; }
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
            const dynamicFields = subType.map(f => ({ ...f, isDynamic: true }));
            fields.splice(infoIdx, 1, ...dynamicFields);
          }
          return { ...baseSchema, fields, subSchemaLabel };
        }
        
        return { ...baseSchema, subSchemaLabel };
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

      if (codSegmento === 'B') {
        const baseSchema = JSON.parse(JSON.stringify(CNAB_SCHEMAS.segmento_b));
        let subType = CNAB_SEGMENTO_B_SUB_TYPES.standard;
        let subSchemaLabel = "Padrão (Crédito)";
        let isDebito = false;
        let isPix = false;
        
        if (rawLines.length > 0 && index >= 0) {
          const currentLote = line.substring(3, 7);
          for (let i = index; i >= 0; i--) {
            const l = rawLines[i];
            if (l.substring(3, 7) === currentLote && l.substring(7, 8) === "1") {
              const tipoOperacao = l.substring(8, 9);
              const formaLancamento = l.substring(11, 13);
              
              if (["45", "47"].includes(formaLancamento)) {
                isPix = true;
                subType = [...CNAB_SEGMENTO_B_SUB_TYPES.pix];
                subSchemaLabel = "PIX";
                const g100 = line.substring(14, 17);
                const chaveIdx = subType.findIndex(f => f.name === "chave_pix");
                if (chaveIdx !== -1) {
                  if (g100 === "05") subType[chaveIdx] = { ...subType[chaveIdx], label: "Tipo de Conta do Recebedor" };
                  else if (["01", "02", "04"].includes(g100)) subType[chaveIdx] = { ...subType[chaveIdx], label: "Chave Pix (Email/Telefone/Aleatória)" };
                }
              } else if (tipoOperacao === "D") {
                subType = CNAB_SEGMENTO_B_SUB_TYPES.debito;
                subSchemaLabel = "Débito em Conta";
                isDebito = true;
              }
              break;
            }
          }
        }

        // Ajuste de Labels e Campos Finais baseados no tipo
        if (isDebito) {
          const fIdx = baseSchema.fields.findIndex(f => f.name === "forma_iniciacao");
          const tIdx = baseSchema.fields.findIndex(f => f.name === "tipo_inscricao");
          const nIdx = baseSchema.fields.findIndex(f => f.name === "numero_inscricao");
          if (fIdx !== -1) {
            baseSchema.fields[fIdx].label = "Uso Exclusivo FEBRABAN/CNAB";
            baseSchema.fields[fIdx].ruleId = "G004";
          }
          if (tIdx !== -1) baseSchema.fields[tIdx].label = "Tipo de Inscrição do Pagador";
          if (nIdx !== -1) baseSchema.fields[nIdx].label = "Nº de Inscrição do Pagador";
          
          // Remove campos de UG/ISPB que não existem no Débito (são Brancos)
          baseSchema.fields = baseSchema.fields.filter(f => !["codigo_ug_centralizadora", "codigo_ispb"].includes(f.name));
          // Adiciona o campo de Uso FEBRABAN final
          baseSchema.fields.push({ name: "uso_exclusivo_febraban_b", ruleId: "G004", start: 227, end: 240, type: "A", label: "Uso Exclusivo FEBRABAN", default: " " });
        } else if (isPix) {
          const fIdx = baseSchema.fields.findIndex(f => f.name === "forma_iniciacao");
          const tIdx = baseSchema.fields.findIndex(f => f.name === "tipo_inscricao");
          const nIdx = baseSchema.fields.findIndex(f => f.name === "numero_inscricao");
          if (fIdx !== -1) {
            baseSchema.fields[fIdx].label = "Forma de Iniciação";
            baseSchema.fields[fIdx].ruleId = "G100";
          }
          if (tIdx !== -1) baseSchema.fields[tIdx].label = "Tipo de Inscrição do Favorecido";
          if (nIdx !== -1) baseSchema.fields[nIdx].label = "Nº de Inscrição do Favorecido";
        } else {
          // Outros créditos (01, 03, etc) -> Campo de iniciação deve ser Filler
          const fIdx = baseSchema.fields.findIndex(f => f.name === "forma_iniciacao");
          if (fIdx !== -1) {
            baseSchema.fields[fIdx].label = "Uso Exclusivo FEBRABAN/CNAB";
            baseSchema.fields[fIdx].ruleId = "G004";
          }
          const tIdx = baseSchema.fields.findIndex(f => f.name === "tipo_inscricao");
          const nIdx = baseSchema.fields.findIndex(f => f.name === "numero_inscricao");
          if (tIdx !== -1) baseSchema.fields[tIdx].label = "Tipo de Inscrição do Favorecido";
          if (nIdx !== -1) baseSchema.fields[nIdx].label = "Nº de Inscrição do Favorecido";
        }

        const fields = [...baseSchema.fields];
        const infoIdx = fields.findIndex(f => f.name === "informacoes_complementares_b");
        if (infoIdx !== -1) {
          const dynamicFields = subType.map(f => ({ ...f, isDynamic: true }));
          fields.splice(infoIdx, 1, ...dynamicFields);
        }
        // Re-ordena os campos por posição de início para garantir integridade
        fields.sort((a, b) => a.start - b.start);
        return { ...baseSchema, fields, subSchemaLabel };
      }

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
    const result = { 
      _metadata: { 
        raw: line, 
        errors: {}, 
        lote: cnabEngine.getLoteNumber(line),
        subSchemaLabel: schema?.subSchemaLabel || null
      } 
    };
    
    // Validação de Tamanho
    if (line.length !== 240) {
      result._metadata.errors._line = `Tamanho inválido: ${line.length} (esperado 240)`;
    }

    if (!schema) return result;

    schema.fields.forEach(field => {
      const val = line.substring(field.start - 1, field.end);
      result[field.name] = val;

      // Validação básica de tipo
      if (field.type === "N") {
        if (!/^\d+$/.test(val)) {
          result._metadata.errors[field.name] = "Campo numérico contém caracteres inválidos (apenas 0-9 permitidos)";
        }
      } else if (field.type === "A") {
        const isSpecial = ["G102", "G101", "G031"].includes(field.ruleId);
        // Estrito: Apenas A-Z, a-z, 0-9 e Espaço. Especial: Permite -, @, ., /
        const regex = isSpecial 
          ? /^[A-Za-z0-9\s\-\.\/\@]*$/ 
          : /^[A-Za-z0-9\s]*$/;

        if (!regex.test(val)) {
          result._metadata.errors[field.name] = isSpecial
            ? "Campo contém caracteres especiais não permitidos (permitidos: - . / @)"
            : "Este campo não permite acentos ou símbolos (apenas letras, números e espaços)";
        }
      }
    });

    // Segunda passada: Validação de regras específicas
    schema.fields.forEach(field => {
      const fieldId = `${schema.id}:${field.name}`;
      const isDisabled = disabledFields.includes(fieldId);
      const ruleName = field.rule || field.ruleId;

      // Só executa regra se não houver erro de tipo básico já reportado (para não sobrecarregar)
      if (!result._metadata.errors[field.name] && !isDisabled && ruleName && CNAB_RULES[ruleName] && activeRules[ruleName] !== false) {
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
