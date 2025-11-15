const JSZip = require('jszip');
const xml2js = require('xml2js');
const path = require('path');

class EPUBParserService {

  async parseEPUB(epubBuffer) {
    const zip = await JSZip.loadAsync(epubBuffer);
    
    const containerXML = await zip.file('META-INF/container.xml').async('text');
    const opfPath = await this._extractOPFPath(containerXML);
    
    const opfContent = await zip.file(opfPath).async('text');
    const opfData = await this._parseXML(opfContent);
    
    const manifest = this._buildManifest(opfData);
    const spine = this._extractSpine(opfData, manifest);
    
    const tocItems = await this._extractTOC(zip, opfPath, manifest, opfData);
    
    const chapters = await this._extractChapters(zip, spine, opfPath);
    
    const structure = this._buildStructure(tocItems, spine, chapters);
    
    return { structure, chapters };
  }

  async _extractOPFPath(containerXML) {
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(containerXML);
    return result.container.rootfiles[0].rootfile[0].$['full-path'];
  }

  async _parseXML(xmlString) {
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true
    });
    return await parser.parseStringPromise(xmlString);
  }

  _buildManifest(opfData) {
    const manifest = {};
    const items = Array.isArray(opfData.package.manifest.item) 
      ? opfData.package.manifest.item 
      : [opfData.package.manifest.item];
    
    items.forEach(item => {
      manifest[item.id] = {
        href: item.href,
        mediaType: item['media-type']
      };
    });
    return manifest;
  }

  _extractSpine(opfData, manifest) {
    const itemrefs = Array.isArray(opfData.package.spine.itemref)
      ? opfData.package.spine.itemref
      : [opfData.package.spine.itemref];
    
    return itemrefs.map(ref => {
      const idref = ref.idref;
      return {
        id: idref,
        href: manifest[idref]?.href || null
      };
    }).filter(item => item.href);
  }

  async _extractTOC(zip, opfPath, manifest, opfData) {
    const opfDir = path.dirname(opfPath);
    
    // Test EPUB3 nav.xhtml first
    const navItem = Object.values(manifest).find(
      item => item.mediaType === 'application/xhtml+xml' && 
              (item.href.includes('nav') || item.href.includes('toc'))
    );
    
    if (navItem) {
      const navPath = path.join(opfDir, navItem.href).replace(/\\/g, '/');
      const navFile = zip.file(navPath);
      if (navFile) {
        const navContent = await navFile.async('text');
        return this._parseNavXHTML(navContent);
      }
    }
    
    // Fallback: EPUB2 toc.ncx
    const ncxId = opfData.package.spine.toc;
    if (ncxId && manifest[ncxId]) {
      const ncxPath = path.join(opfDir, manifest[ncxId].href).replace(/\\/g, '/');
      const ncxFile = zip.file(ncxPath);
      if (ncxFile) {
        const ncxContent = await ncxFile.async('text');
        return this._parseNCX(ncxContent);
      }
    }
    
    return [];
  }

  async _parseNavXHTML(navHTML) {
    const tocMatch = navHTML.match(/<nav[^>]*epub:type=["']toc["'][^>]*>([\s\S]*?)<\/nav>/i);
    if (!tocMatch) return [];
    
    const tocContent = tocMatch[1];
    const items = [];
    
    const liRegex = /<li[^>]*>[\s\S]*?<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    
    while ((match = liRegex.exec(tocContent)) !== null) {
      const href = match[1].split('#')[0];
      const title = match[2].replace(/<[^>]+>/g, '').trim();
      items.push({ title, href });
    }
    
    return items;
  }

  async _parseNCX(ncxContent) {
    const ncxData = await this._parseXML(ncxContent);
    const navMap = ncxData.ncx.navMap.navPoint;
    const points = Array.isArray(navMap) ? navMap : [navMap];
    
    return points.map(point => ({
      title: point.navLabel.text,
      href: point.content.src.split('#')[0]
    }));
  }

  async _extractChapters(zip, spine, opfPath) {
    const opfDir = path.dirname(opfPath);
    const chapters = new Map();
    
    for (let i = 0; i < spine.length; i++) {
      const item = spine[i];
      const filePath = path.join(opfDir, item.href).replace(/\\/g, '/');
      const file = zip.file(filePath);
      
      if (file) {
        const content = await file.async('text');
        const cleanContent = this._cleanHTML(content);
        
        chapters.set(i + 1, {
          globalChapterNumber: i + 1,
          href: item.href,
          title: `Chapter ${i + 1}`,
          content: cleanContent
        });
      }
    }
    
    return chapters;
  }

  _cleanHTML(html) {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
  }

  _buildStructure(tocItems, spine, chapters) {
    const structure = [];
    let currentPart = null;
    let partChapterIndex = 0;
    
    tocItems.forEach((item) => {
      const chapterEntry = Array.from(chapters.values()).find(
        ch => ch.href === item.href
      );
      
      if (!chapterEntry) return;
      
      const title = item.title;
      
      if (/^(part|book)\s+/i.test(title)) {
        if (currentPart) structure.push(currentPart);
        currentPart = {
          type: 'part',
          title: title,
          chapters: []
        };
        partChapterIndex = 0;
      } else {
        partChapterIndex++;
        const chapterData = {
          partChapterNumber: partChapterIndex,
          globalChapterNumber: chapterEntry.globalChapterNumber,
          title: title
        };
        
        if (currentPart) {
          currentPart.chapters.push(chapterData);
        } else {
          structure.push({
            type: 'chapter',
            ...chapterData
          });
        }
      }
    });
    
    if (currentPart) structure.push(currentPart);
    return structure;
  }
}

module.exports = new EPUBParserService();