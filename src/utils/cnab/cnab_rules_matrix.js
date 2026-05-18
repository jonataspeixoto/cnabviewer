export function isSegmentAllowed(codSegmento, formaLancamento, tipoServico) {
  if (!codSegmento || !formaLancamento || !tipoServico) return true; // Fallback se o header estiver completamente corrompido, a validação de campos pegará.

  const seg = String(codSegmento).toUpperCase().trim();
  if (!seg) return true; // Permite passar no validador de matriz (será pego pelas regras de campo obrigatório)

  const forma = String(formaLancamento).padStart(2, '0');
  const servico = String(tipoServico).padStart(2, '0');

  // Lotes de Cobrança (Tipo de Serviço 01) -> Aceitam P, Q, R, S, Y
  if (servico === "01") {
    return ["P", "Q", "R", "S", "Y"].includes(seg);
  }

  // Tributos e Impostos: Formas 16, 17, 18, 19, 21, 22, 25, 26, 27
  const formasTributo = ["16", "17", "18", "19", "21", "22", "25", "26", "27"];
  if (formasTributo.includes(forma)) {
    return ["N", "W", "Z"].includes(seg);
  }

  // Concessionárias / Contas: Forma 13. (Forma 11 também pode ser usada se o serviço for 22, dependendo do banco)
  if (forma === "13" || (forma === "11" && servico === "22")) {
    if (forma === "11") {
        return ["J", "O", "W", "Z"].includes(seg); // Forma 11 aceita J (boletos de tributos) ou O (concessionária nativa)
    }
    return ["O", "W", "Z"].includes(seg);
  }

  // Boletos (Cobrança Pagamento a Terceiros): Formas 30, 31 (e 11 já tratado acima)
  const formasBoleto = ["30", "31"];
  if (formasBoleto.includes(forma)) {
    return ["J", "Z"].includes(seg); // J-52 tem codSegmento="J" no parsing cru
  }

  // Pagamentos / Transferências / PIX: Formas 01, 02, 03, 04, 05, 10, 41, 43, 45
  const formasPagamento = ["01", "02", "03", "04", "05", "10", "41", "43", "45"];
  if (formasPagamento.includes(forma)) {
    return ["A", "B", "Z"].includes(seg);
  }

  // Segmento C e D (Custódia e Extrato) não estão amplamente padronizados em pagamentos, mas existem.
  if (["C", "D", "E", "F", "G", "H", "I", "K", "L"].includes(seg)) {
      return true; // Deixa passar os que não catalogamos rigidamente
  }

  // Se cair aqui, é um segmento principal sendo usado em uma forma de lançamento incompatível
  return false;
}
