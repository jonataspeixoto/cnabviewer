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
        const response = await fetch('docs/febraban-v109.md');
        if (!response.ok) throw new Error('Falha ao carregar o manual');
        let text = await response.text();
        
        // 1. Remoção de Ruído (Headers/Footers/Logos/Slogans/Páginas)
        // Remove o bloco completo de rodapé/cabeçalho do PDF original
        const noiseRegex = /\n+\d*\s*\n*(?:[“"']?Um sistema financeiro saudável[\s\S]*?sustentável do País[”"']?)?\s*\n*!\[FEBRABAN logo\][\s\S]*?http:\/\/www\.febraban\.org\.br\s*\n*\d*/gi;
        text = text.replace(noiseRegex, '\n\n');
        
        // Remove ocorrências soltas da frase institucional que possam ter sobrado
        text = text.replace(/[“\""'\(«\[\s]*[U\?o]*m sistema financeiro saud[áǭ]vel[\s\S]*?sustent[áǭ]vel do Pa[í\?s]*[\s”\""'»\]\)\d\s]*/g, '');
        text = text.replace(/page_\d+_image_\d+_v\d+\.jpg/g, '');

        // 2. Correção de Títulos que deveriam ser Itens (Índice)
        // Converte títulos que terminam em número (página) para parágrafos em negrito
        text = text.replace(/^#+ (.*?[\.\s]+\d+\**)$/gm, '**$1**');
        // Remove # de itens de índice que não deveriam ser títulos
        text = text.replace(/^#+ (.*?[\d\.]+\s*)$/gm, '$1');

        // 3. Pré-processamento: Une linhas de índice quebradas e separa entradas coladas
        const lines = text.split('\n');
        const processedLines = [];
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();
          if (!line) {
            processedLines.push('');
            continue;
          }
          
          // Se a linha parece um começo de índice (ex: 3.1.2 ou A -) mas não tem número de página no fim
          if (/^((?:\d+\.)+\d*\s+|[A-Z\s]{1,3}\s?-\s?)/.test(line) && !/[\.\s]\d+\**$/.test(line)) {
            // Tenta espiar as próximas linhas para ver se encontra o fim da entrada (número de página)
            let j = i + 1;
            while (j < lines.length && j < i + 4) { // No máximo 4 linhas de profundidade
              let nextLine = lines[j].trim();
              if (!nextLine) { j++; continue; }
              
              // Se a próxima linha parece um NOVO item de índice, paramos (mas não se for apenas continuação)
              if (/^((?:\d+\.)+\d*\s+|[A-Z\s]{1,3}\s?-\s?)/.test(nextLine)) break;
              
              // Adicionamos a linha atual
              line = line + ' ' + nextLine;
              i = j;

              // Se agora temos uma página no fim, paramos de unir
              if (/[\.\s]\d+\**$/.test(line)) break;
              
              j++;
            }
          }
          processedLines.push(line);
        }
        text = processedLines.join('\n');
        
        // Separa casos como "... 143 B - Boleto ... 145"
        text = text.replace(/(\d+)\s+([A-Z\s]{1,3}\s?-\s?[^-\n]*?\s+(?:\.{3,}| {3,})\s*\d+)/g, '$1\n\n$2');
        
        // Garante que entradas de índice fiquem em parágrafos separados
        text = text.replace(/([A-Z0-9\.\s-]+? - .*?\s+\d+)\s*\n/g, '$1\n\n');
        text = text.replace(/(\.{3,}\s*\d+\**)\s*\n([^\n#])/g, '$1\n\n$2');
        
        // 4. Limpeza final e normalização de negrito
        // Remove \n entre ** ** e substitui por espaço
        text = text.replace(/\*\*([\s\S]*?)\*\*/g, (m, content) => '**' + content.replace(/\s*\n\s*/g, ' ') + '**');
        
        // Remove qualquer resquício da frase institucional (captura variações extremas)
        text = text.replace(/[\(\[“\""']*.*Um sistema financeiro saud[áǭ]vel[\s\S]*?sustent[áǭ]vel do Pa[í\?s]*.*\d*.*[\)\]”\""']*/gi, '');
        
        // Remove linhas vazias extras
        text = text.replace(/\n{4,}/g, '\n\n');
        
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
    
    // 2. Adiciona IDs aos headers para permitir navegação via âncoras
    // O ID deve ser gerado da mesma forma que o slug no índice
    processedHtml = processedHtml.replace(/<h([1-6])>(.*?)<\/h\1>/g, (m, level, content) => {
      const cleanText = content
        .replace(/<[^>]+>/g, '') // Remove tags
        .replace(/^\d+(\.\d+)*\s*[-–]?\s*/, '') // Remove numeração inicial para bater com o slugify
        .trim();
      const id = this.slugify(cleanText);
      return `<h${level} id="${id}">${content}</h${level}>`;
    });

    // 3. Captura entradas de índice de forma global e robusta
    // Suporta labels com quebras de linha e entradas "grudadas" em outras tags
    const entryRegex = /(?:<p>|<a>|<\/a>|^)\s*([^><\n]+?(?:\n[^><\n]+?)*?)\s*(\.{2,}| {2,})\s*(\d+)\s*(?:<\/p>|<a>|<\/a>|$)/gm;
    
    processedHtml = processedHtml.replace(entryRegex, (match, label, dots, page) => {
      // Verifica se a entrada original tinha negrito (** ou # que virou ** ou h)
      // O usuário quer bold apenas se houver # ou ** no original.
      // Verificamos o match original (que pode vir do marked como <strong> ou literal ** se o pre-processor não pegou)
      const isBold = match.includes('<strong>') || 
                     match.includes('<b>') || 
                     label.includes('<strong>') || 
                     label.includes('**');

      // Limpa o label
      const cleanLabel = label
        .replace(/<[^>]+>/g, '') 
        .replace(/\*\*/g, '')
        .replace(/\.+$/, '')
        .trim();
        
      if (!cleanLabel || cleanLabel.length < 3) return match;

      // Evita falsos positivos
      if (dots.trim() === '' && !/^[A-Z\d]/.test(cleanLabel)) return match;

      // Gera o slug removendo a numeração para bater com os headers
      const slugLabel = cleanLabel.replace(/^\d+(\.\d+)*\s*[-–]?\s*/, '').trim();
      const slug = this.slugify(slugLabel || cleanLabel);
      
      const labelContent = isBold ? `<strong>${cleanLabel}</strong>` : cleanLabel;
      
      return `
        <a href="#${slug}" class="dotted-leader-link">
          <div class="dotted-leader">
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
