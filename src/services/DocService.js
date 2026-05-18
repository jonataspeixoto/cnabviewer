import { marked } from 'marked';

const CUSTOM_RULES_FALLBACK = {
  STRUC_B: {
    id: "STRUC_B",
    title: "Estrutura do Segmento B",
    description: "Regra de acoplamento do Segmento B ao Segmento A. Garante que todo Registro do tipo Segmento A seja seguido imediatamente pelo Segmento B contendo os dados complementares obrigatórios do favorecido.",
    html: "<p>Regra de acoplamento do Segmento B ao Segmento A. Garante que todo Registro do tipo Segmento A seja seguido imediatamente pelo Segmento B contendo os dados complementares obrigatórios do favorecido.</p>"
  },
  isNumeric: {
    id: "isNumeric",
    title: "Validação Numérica Básica",
    description: "Garante que o campo contenha estritamente dígitos numéricos (0-9) conforme especificado no leiaute do arquivo CNAB.",
    html: "<p>Garante que o campo contenha estritamente dígitos numéricos (0-9) conforme especificado no leiaute do arquivo CNAB.</p>"
  },
  validateDate: {
    id: "validateDate",
    title: "Validação de Formato de Data",
    description: "Verifica se a data fornecida é uma data válida e está formatada corretamente no padrão FEBRABAN (geralmente DDMMAAAA ou DDMMAA).",
    html: "<p>Verifica se a data fornecida é uma data válida e está formatada corretamente no padrão FEBRABAN (geralmente DDMMAAAA ou DDMMAA).</p>"
  },
  validateCNPJ_CPF: {
    id: "validateCNPJ_CPF",
    title: "Validação de CPF / CNPJ",
    description: "Verifica se o número de inscrição (CPF ou CNPJ) possui a quantidade correta de dígitos e atende aos critérios dos algoritmos de validação de dígitos verificadores oficiais.",
    html: "<p>Verifica se o número de inscrição (CPF ou CNPJ) possui a quantidade correta de dígitos e atende aos critérios dos algoritmos de validação de dígitos verificadores oficiais.</p>"
  },
  validateInscricaoTipo: {
    id: "validateInscricaoTipo",
    title: "Validação de Tipo de Inscrição",
    description: "Garante que o tipo de inscrição do participante do lote (1 = CPF, 2 = CNPJ, etc.) seja compatível com a quantidade de dígitos informada no campo de número de inscrição.",
    html: "<p>Garante que o tipo de inscrição do participante do lote (1 = CPF, 2 = CNPJ, etc.) seja compatível com a quantidade de dígitos informada no campo de número de inscrição.</p>"
  },
  validateUF: {
    id: "validateUF",
    title: "Validação de Sigla de Estado (UF)",
    description: "Verifica se a sigla informada corresponde a uma das 27 Unidades Federativas (estados) válidas do Brasil.",
    html: "<p>Verifica se a sigla informada corresponde a uma das 27 Unidades Federativas (estados) válidas do Brasil.</p>"
  },
  validateCurrency: {
    id: "validateCurrency",
    title: "Validação de Formato de Valor/Moeda",
    description: "Garante que campos de valores monetários estejam formatados com os decimais corretos e sem caracteres especiais inválidos.",
    html: "<p>Garante que campos de valores monetários estejam formatados com os decimais corretos e sem caracteres especiais inválidos.</p>"
  },
  validateDV: {
    id: "validateDV",
    title: "Validação de Dígitos Verificadores (DV)",
    description: "Garante que os dígitos verificadores de Agência, Conta Corrente ou Agência/Conta combinadas estejam corretos segundo as regras matemáticas de módulo 10 ou 11 do respectivo banco.",
    html: "<p>Garante que os dígitos verificadores de Agência, Conta Corrente ou Agência/Conta combinadas estejam corretos segundo as regras matemáticas de módulo 10 ou 11 do respectivo banco.</p>"
  },
  validateExtratoBalance: {
    id: "validateExtratoBalance",
    title: "Validação de Conciliação de Saldos",
    description: "Validação cruzada para garantir que a soma dos saldos iniciais, créditos e débitos seja igual ao saldo final em registros de Extrato de Conta Corrente.",
    html: "<p>Validação cruzada para garantir que a soma dos saldos iniciais, créditos e débitos seja igual ao saldo final em registros de Extrato de Conta Corrente.</p>"
  },
  N000: {
    id: "N000",
    title: "Informações Complementares do Tributo",
    description: "Campo destinado a informações específicas do tributo (inscrição municipal, taxas extras, etc.) de acordo com a prefeitura ou órgão emissor do tributo.",
    html: "<p>Campo destinado a informações específicas do tributo (inscrição municipal, taxas extras, etc.) de acordo com a prefeitura ou órgão emissor do tributo.</p>"
  }
};

class DocService {
  constructor() {
    this.rawContent = '';
    this.rulesIndex = {};
    this.sectionsIndex = {};
    this.isLoaded = false;
    this.loadingPromise = null;
    
    // Configura o marked para lidar com blocos mermaid
    marked.use({
      renderer: {
        code({ text, lang }) {
          if (lang === 'mermaid') {
            return `<div class="mermaid">${text}</div>`;
          }
          return `<pre><code class="language-${lang}">${text}</code></pre>`;
        }
      }
    });
  }

  async load() {
    if (this.isLoaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      try {
        const response = await fetch('docs/febraban-v109.md');
        if (!response.ok) throw new Error('Falha ao carregar o manual');
        let text = await response.text();
        
        // Versão Pura: Não mexe em nada do conteúdo para evitar "Catastrophic Backtracking" 
        // ou unificação indevida de linhas que quebram o Mermaid e o Markdown.
        this.rawContent = text;
        this.parse();
        this.isLoaded = true;
      } catch (error) {
        console.error('DocService Error:', error);
        throw error;
      }
    })();

    return this.loadingPromise;
  }

  parse() {
    let match;

    // 1. Indexa Regras por linhas de tabela <tr> ... </tr> (Gxxx, Cxxx, etc.)
    // Restringe a busca ao escopo de cada linha de tabela para evitar agrupamentos indevidos (Catastrophic Backtracking)
    const tableRuleRegex = /<tr>\s*<(?:td|th)>(?:<strong>)?([A-Z]\d{3})(?:<\/strong>)?<\/(?:td|th)>\s*<(?:td|th)>([\s\S]*?)<\/(?:td|th)>\s*<(?:td|th)>(?:<strong>)?\1(?:<\/strong>)?<\/(?:td|th)>\s*<\/tr>/g;
    while ((match = tableRuleRegex.exec(this.rawContent)) !== null) {
      const [_, id, fullContent] = match;
      
      const titleMatch = fullContent.match(/<strong>(.*?)<\/strong>/);
      const title = titleMatch ? titleMatch[1] : id;
      const description = fullContent.replace(/<strong>.*?<\/strong><br\/>/, '').trim();

      this.rulesIndex[id] = {
        id,
        title,
        description: description,
        html: this.formatHtml(marked.parse(description))
      };
    }

    // 2. Indexa Regras em formato de Header Markdown (# G100 ...)
    const headerRuleRegex = /^#+\s+([A-Z]\d{3})\b\s*(.*?)$/gm;
    headerRuleRegex.lastIndex = 0;
    while ((match = headerRuleRegex.exec(this.rawContent)) !== null) {
      const [_, id, title] = match;
      const startPos = match.index;
      
      const nextHeaderRegex = /^#+\s+/gm;
      nextHeaderRegex.lastIndex = startPos + match[0].length;
      const nextMatch = nextHeaderRegex.exec(this.rawContent);
      const endPos = nextMatch ? nextMatch.index : this.rawContent.length;
      
      const description = this.rawContent.substring(startPos + match[0].length, endPos).trim();
      
      if (!this.rulesIndex[id]) {
        this.rulesIndex[id] = {
          id,
          title: title.trim(),
          description: description,
          html: this.formatHtml(marked.parse(description))
        };
      }
    }

    // 3. Indexa Seções (Headers de conteúdo)
    const sectionRegex = /^#+ (.*?)$/gm;
    sectionRegex.lastIndex = 0;
    while ((match = sectionRegex.exec(this.rawContent)) !== null) {
      const [_, title] = match;
      const cleanTitle = title.toLowerCase()
        .replace(/^\d+(\.\d+)*\s*[-–]?\s*/, '') 
        .trim();
        
      this.sectionsIndex[title.toLowerCase()] = match.index;
      if (cleanTitle !== title.toLowerCase()) {
        this.sectionsIndex[cleanTitle] = match.index;
      }
    }
  }

  getSectionHtml(sectionName) {
    if (!sectionName) return null;
    const q = sectionName.toLowerCase()
      .replace(/\(.*\)/, '')
      .replace(/registro\s+/i, '')
      .trim();

    const words = q.split(/\s+/).filter(w => w.length > 2);
    
    let key = Object.keys(this.sectionsIndex).find(k => k === q);
    if (!key) {
      key = Object.keys(this.sectionsIndex).find(k => k.includes(q));
    }
    if (!key && words.length > 0) {
      key = Object.keys(this.sectionsIndex).find(k => 
        words.every(w => k.includes(w))
      );
    }

    if (!key) return null;

    const startPos = this.sectionsIndex[key];
    const nextSectionPos = Object.values(this.sectionsIndex)
      .filter(pos => pos > startPos)
      .sort((a, b) => a - b)[0] || this.rawContent.length;
    
    const content = this.rawContent.substring(startPos, nextSectionPos);
    return {
      title: key.toUpperCase(),
      html: this.formatHtml(marked.parse(content))
    };
  }

  formatHtml(html) {
    if (!html) return '';
    let processedHtml = html
      .replace(/<table>/g, '<div class="table-container"><table>')
      .replace(/<\/table>/g, '</table></div>');
    
    processedHtml = processedHtml.replace(/<h([1-6])>(.*?)<\/h\1>/g, (m, level, content) => {
      const cleanText = content
        .replace(/<[^>]+>/g, '')
        .replace(/^\d+(\.\d+)*\s*[-–]?\s*/, '') 
        .trim();
      const id = this.slugify(cleanText);
      return `<h${level} id="${id}">${content}</h${level}>`;
    });

    const entryRegex = /(?:<p>|<a>|<\/a>|^)\s*((?:<[^>]+>|[^><\n])+?)\s*(\.{2,}| {2,})\s*(\d+)\s*(?:(?:\*\*|__|<\/[^>]+>)\s*)?(?:<\/p>|<a>|<\/a>|$)/gm;
    
    processedHtml = processedHtml.replace(entryRegex, (match, label, dots, page) => {
      const isBold = match.includes('<strong>') || 
                     match.includes('<b>') || 
                     label.includes('<strong>') || 
                     label.includes('**');

      const cleanLabel = label
        .replace(/<[^>]+>/g, '') 
        .replace(/\*\*/g, '')
        .replace(/\.+$/, '')
        .trim();
        
      if (!cleanLabel || cleanLabel.length < 3) return match;

      if (dots.trim() === '' && !/^[A-Z\d]/.test(cleanLabel)) return match;

      const slugLabel = cleanLabel.replace(/^\d+(\.\d+)*\s*[-–]?\s*/, '').trim();
      const slug = this.slugify(slugLabel || cleanLabel);
      
      const labelContent = isBold ? `<strong>${cleanLabel}</strong>` : cleanLabel;
      
      return `
        <a href="#${slug}" class="dotted-leader-link">
          <div class="dotted-leader ${isBold ? 'is-bold' : ''}">
            <span class="label">${labelContent}</span>
            <span class="dots"></span>
            <span class="page">${page}</span>
          </div>
        </a>
      `;
    });

    return processedHtml;
  }

  slugify(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  getRule(ruleId) {
    if (!ruleId) return null;
    const cleanId = ruleId.replace('*', '').trim();
    
    // Fallback para regras customizadas
    if (CUSTOM_RULES_FALLBACK[cleanId]) {
      return CUSTOM_RULES_FALLBACK[cleanId];
    }
    
    return this.rulesIndex[cleanId] || null;
  }

  searchSections(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase().trim();
    const results = [];
    
    // 1. Busca nas Seções do Manual
    Object.keys(this.sectionsIndex).forEach(k => {
      if (k.includes(q)) {
        results.push({
          title: `Seção: ${k.toUpperCase()}`,
          id: k,
          type: 'section'
        });
      }
    });
    
    // 2. Busca nas Regras Indexadas (por ID ou Título)
    Object.keys(this.rulesIndex).forEach(id => {
      const rule = this.rulesIndex[id];
      if (id.toLowerCase().includes(q) || rule.title.toLowerCase().includes(q)) {
        results.push({
          title: `Regra ${id}: ${rule.title}`,
          id: id,
          type: 'rule'
        });
      }
    });

    // 3. Busca nas Regras Customizadas (Fallback)
    Object.keys(CUSTOM_RULES_FALLBACK).forEach(id => {
      const rule = CUSTOM_RULES_FALLBACK[id];
      if (id.toLowerCase().includes(q) || rule.title.toLowerCase().includes(q)) {
        results.push({
          title: `Regra ${id}: ${rule.title}`,
          id: id,
          type: 'rule'
        });
      }
    });
    
    return results.slice(0, 15);
  }
}

export const docService = new DocService();
