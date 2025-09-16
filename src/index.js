const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

class MarkdownConverter {
  constructor(options = {}) {
    this.inputDir = options.input || './docs';
    this.outputDir = options.output || './dist';
  }

  // 处理 Markdown 文件中的链接，将 .md 链接转换为 .html
  processLinks(content) {
    return content.replace(/\[([^\]]+)\]\(([^)]+\.md)\)/g, (match, text, link) => {
      const htmlLink = link.replace(/\.md$/, '.html');
      return `[${text}](${htmlLink})`;
    });
  }

  // 转换单个 Markdown 文件
  convertFile(inputPath, outputPath) {
    try {
      let content = fs.readFileSync(inputPath, 'utf8');
      
      // 处理文档间的链接
      content = this.processLinks(content);
      
      // 转换为 HTML
      const html = marked(content);
      
      // 创建完整的 HTML 页面
      const fullHtml = this.createHtmlPage(html, path.basename(inputPath, '.md'));
      
      // 确保输出目录存在
      const outputDirPath = path.dirname(outputPath);
      if (!fs.existsSync(outputDirPath)) {
        fs.mkdirSync(outputDirPath, { recursive: true });
      }
      
      // 写入文件
      fs.writeFileSync(outputPath, fullHtml);
      console.log(`✓ 转换完成: ${inputPath} -> ${outputPath}`);
      
    } catch (error) {
      console.error(`✗ 转换失败: ${inputPath}`, error.message);
    }
  }

  // 创建完整的 HTML 页面
  createHtmlPage(content, title) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        h1 { border-bottom: 1px solid #eaecef; padding-bottom: 10px; }
        code {
            background-color: #f6f8fa;
            border-radius: 3px;
            font-size: 85%;
            margin: 0;
            padding: 0.2em 0.4em;
        }
        pre {
            background-color: #f6f8fa;
            border-radius: 6px;
            font-size: 85%;
            line-height: 1.45;
            overflow: auto;
            padding: 16px;
        }
        pre code {
            background-color: transparent;
            border: 0;
            display: inline;
            line-height: inherit;
            margin: 0;
            max-width: auto;
            overflow: visible;
            padding: 0;
            word-wrap: normal;
        }
        blockquote {
            border-left: 0.25em solid #dfe2e5;
            color: #6a737d;
            margin: 0;
            padding: 0 1em;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        th, td {
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
        }
        th {
            background-color: #f6f8fa;
            font-weight: 600;
        }
        a {
            color: #0366d6;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
  }

  // 扫描目录中的所有 Markdown 文件
  scanMarkdownFiles(dir) {
    const files = [];
    
    function scanDir(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    }
    
    if (fs.existsSync(dir)) {
      scanDir(dir);
    }
    
    return files;
  }

  // 转换所有文件
  convertAll() {
    console.log(`开始转换 Markdown 文件...`);
    console.log(`输入目录: ${this.inputDir}`);
    console.log(`输出目录: ${this.outputDir}`);
    
    const markdownFiles = this.scanMarkdownFiles(this.inputDir);
    
    if (markdownFiles.length === 0) {
      console.log('未找到 Markdown 文件');
      return;
    }
    
    console.log(`找到 ${markdownFiles.length} 个 Markdown 文件`);
    
    for (const inputPath of markdownFiles) {
      const relativePath = path.relative(this.inputDir, inputPath);
      const outputPath = path.join(this.outputDir, relativePath.replace(/\.md$/, '.html'));
      this.convertFile(inputPath, outputPath);
    }
    
    console.log('转换完成！');
  }
}

module.exports = MarkdownConverter;