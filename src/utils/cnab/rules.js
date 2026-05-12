export const CNAB_RULES = {
  isNumeric: (val) => /^\d+$/.test(val) || "Deve conter apenas números",
  
  isAlpha: (val) => true, // Praticamente qualquer char é aceito em campos alfanuméricos
  
  validateDate: (val) => {
    if (!val || val === "00000000" || val.trim() === "0".repeat(val.length)) return true;
    if (!/^\d{8}$/.test(val)) return "Formato inválido (DDMMAAAA)";
    
    const d = parseInt(val.substring(0, 2));
    const m = parseInt(val.substring(2, 4));
    const y = parseInt(val.substring(4, 8));
    
    if (m < 1 || m > 12) return "Mês inválido";
    
    const date = new Date(y, m - 1, d);
    const isValid = (
      date.getFullYear() === y && 
      date.getMonth() === m - 1 && 
      date.getDate() === d
    );
    
    return isValid || "Data inexistente";
  },

  validateTime: (val) => {
    if (!val || val.trim() === "" || val === "000000") return true;
    if (!/^\d{6}$/.test(val)) return "Formato inválido (HHMMSS)";
    const h = parseInt(val.substring(0, 2));
    const m = parseInt(val.substring(2, 4));
    const s = parseInt(val.substring(4, 6));
    if (h > 23 || m > 59 || s > 59) return "Hora inválida";
    return true;
  },
  
  validateInscricaoTipo: (val) => {
    const v = val.trim();
    return ["1", "2"].includes(v) || "1-CPF, 2-CNPJ esperado";
  },
  
  validateCNPJ_CPF: (val) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length === 11 || clean.length === 14) return true;
    return "Tamanho inválido (CPF:11, CNPJ:14)";
  },
  
  validateUF: (val) => {
    const ufs = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
    return ufs.includes(val.trim().toUpperCase()) || "UF Inválida";
  },
  
  validateCurrency: (val) => {
    if (/^\d+$/.test(val)) return true;
    return "Valor deve ser numérico (sem vírgula)";
  },
  
  mandatory: (val) => val.trim().length > 0 || "Campo obrigatório"
};
