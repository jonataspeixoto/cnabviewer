import { marked } from 'marked';

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
    // Indexa Regras (Gxxx, Axxx, etc)
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
