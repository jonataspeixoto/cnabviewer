/**
 * Web Worker para Auditoria CNAB em Segundo Plano
 */
import { performAudit } from './audit_logic';

self.onmessage = (e) => {
  const { rawLines, activeRules, disabledFields } = e.data;
  const total = rawLines.length;
  const CHUNK_SIZE = 1000;

  // Como o processamento agora é feito pela audit_logic, 
  // poderíamos rodar em pedaços se necessário, mas para arquivos < 50k o performAudit é rápido o suficiente.
  // Por enquanto, rodamos tudo e retornamos.
  
  // Progress mock (opcional, já que agora é atômico)
  self.postMessage({ type: 'PROGRESS', progress: 50 });

  const { errors, errorsByLine } = performAudit({ rawLines, activeRules, disabledFields });

  self.postMessage({ 
    type: 'COMPLETE', 
    errors, 
    errorsByLine 
  });
};
