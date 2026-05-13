import { marked } from 'marked';

class DocService {
  constructor() {
    this.rawContent = '';
    this.rulesIndex = {};
    this.sectionsIndex = {};
    this.isLoaded = false;
    this.loadingPromise = null;
  }

  async load() {
    if (this.isLoaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      try {
        const response = await fetch('/docs/febraban-v109.md');
        if (!response.ok) throw new Error('Falha ao carregar o manual');
        let text = await response.text();
        
        // 1. Remoção de Ruído (Headers/Footers repetitivos)
        text = text.replace(/[“\""']Um sistema financeiro saudável.*?País[”\""']\s*\d*/g, '');
        text = text.replace(/!\[FEBRABAN logo\].*?\n/g, '');
        text = text.replace(/FEBRABAN logo/g, '');
        text = text.replace(/Layout Padrão Febraban 240 posições V10.9 http:\/\/www.febraban.org.br/g, '');
        text = text.replace(/page_\d+_image_\d+_v\d+\.jpg/g, '');

        // 2. Correção de Títulos que deveriam ser Itens
        // Remove # de linhas que contém o padrão de pontos do índice
        text = text.replace(/^#+ (.*?\.{5,}.*?)$/gm, '$1');

        // 3. Pré-processamento: Garante que entradas de índice fiquem em parágrafos separados
        text = text.replace(/(\.{5,}\s*\d+\**)\s*\n([^\n#])/g, '$1\n\n$2');
        
        // Remove linhas vazias extras
        text = text.replace(/\n{3,}/g, '\n\n');
        
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
    // Indexa Regras (Gxxx, Axxx, etc)
    // Suporta <td>G001</td> ou <td><strong>G001</strong></td>
    const ruleRegex = /<td>(?:<strong>)?([A-Z]\d{3})(?:<\/strong>)?<\/td>\s*<td>(.*?)<\/td>\s*<td>(?:<strong>)?\1(?:<\/strong>)?<\/td>/gs;
    let match;
    while ((match = ruleRegex.exec(this.rawContent)) !== null) {
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

    // Indexa Seções (Headers)
    const sectionRegex = /^#+ (.*?)$/gm;
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
    
    // Captura entradas de índice de forma global, independente de estarem no mesmo <p>
    // Procuramos o padrão de label + pontos + página
    const entryRegex = /(?:<p>)?([^>\n<]+?)(?:<strong>)?(\.{3,})\s*(\d+)(?:<\/strong>)?(?:<\/p>)?/g;
    
    processedHtml = processedHtml.replace(entryRegex, (match, label, dots, page) => {
      const cleanLabel = label
        .replace(/<\/strong>$/, '')
        .replace(/^<strong>/, '')
        .replace(/\.+$/, '')
        .trim();
        
      if (!cleanLabel || cleanLabel.length < 2) return match;

      const slug = this.slugify(cleanLabel);
      
      return `
        <a href="#${slug}" class="dotted-leader-link">
          <div class="dotted-leader">
            <span class="label"><strong>${cleanLabel}</strong></span>
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
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  getRule(ruleId) {
    const cleanId = ruleId.replace('*', '').trim();
    return this.rulesIndex[cleanId] || null;
  }

  searchSections(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase().trim();
    
    return Object.keys(this.sectionsIndex)
      .filter(k => k.includes(q))
      .map(k => ({
        title: k.toUpperCase(),
        id: k
      }))
      .slice(0, 15);
  }
}

export const docService = new DocService();
