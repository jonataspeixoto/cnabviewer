import { CNAB_SCHEMAS_ARQUIVO } from './schemas/arquivo';
import { CNAB_SCHEMAS_LOTE } from './schemas/lote';
import { CNAB_SCHEMA_SEGMENTO_A } from './schemas/segmento_a';
import { CNAB_SCHEMA_SEGMENTO_B } from './schemas/segmento_b';
import { CNAB_SCHEMA_SEGMENTO_J, CNAB_SEGMENTO_J52_SUB_TYPES } from './schemas/segmento_j';
import { CNAB_SCHEMA_SEGMENTO_P } from './schemas/segmento_p';
import { CNAB_SCHEMA_SEGMENTO_Q } from './schemas/segmento_q';
import { CNAB_SCHEMA_SEGMENTO_R } from './schemas/segmento_r';
import { CNAB_SCHEMA_SEGMENTO_T } from './schemas/segmento_t';
import { CNAB_SCHEMA_SEGMENTO_U } from './schemas/segmento_u';
import { CNAB_SCHEMA_SEGMENTO_S } from './schemas/segmento_s';
import { CNAB_SCHEMA_SEGMENTO_N, CNAB_SEGMENTO_N_SUB_TYPES } from './schemas/segmento_n';
import { CNAB_SCHEMA_SEGMENTO_O } from './schemas/segmento_o';

/**
 * Consolidação Atômica de Schemas CNAB 240 v10.9
 * Estrutura: Um arquivo por segmento para máxima manutenção.
 */
export const CNAB_SCHEMAS = {
  ...CNAB_SCHEMAS_ARQUIVO,
  ...CNAB_SCHEMAS_LOTE,
  ...CNAB_SCHEMA_SEGMENTO_A,
  ...CNAB_SCHEMA_SEGMENTO_B,
  ...CNAB_SCHEMA_SEGMENTO_J,
  ...CNAB_SCHEMA_SEGMENTO_P,
  ...CNAB_SCHEMA_SEGMENTO_Q,
  ...CNAB_SCHEMA_SEGMENTO_R,
  ...CNAB_SCHEMA_SEGMENTO_S,
  ...CNAB_SCHEMA_SEGMENTO_T,
  ...CNAB_SCHEMA_SEGMENTO_U,
  ...CNAB_SCHEMA_SEGMENTO_N,
  ...CNAB_SCHEMA_SEGMENTO_O
};

export { CNAB_SEGMENTO_N_SUB_TYPES, CNAB_SEGMENTO_J52_SUB_TYPES };
