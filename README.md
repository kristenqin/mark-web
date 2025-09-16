# mark-web-converter

简单的 Markdown 到 HTML 转换工具，支持文档间链接的自动转换。

## 功能特性

- 🚀 将 Markdown 文件转换为 HTML
- 🔗 自动处理文档间的相互引用链接（将 `.md` 链接转换为 `.html`）
- 🎨 简洁的 GitHub 风格样式
- 📁 批量处理整个目录，保持目录结构

## 安装

```bash
# 全局安装
npm install -g mark-web-converter

# 或作为项目依赖
npm install mark-web-converter
```

## 使用方法

### 命令行使用

全局安装后可直接使用：

```bash
# 使用默认设置（输入: ./docs, 输出: ./dist）
mark-web-converter

# 指定输入输出目录
mark-web-converter -i ./markdown -o ./html

# 显示帮助
mark-web-converter --help
```

### API 使用（在其他项目中）

```javascript
const MarkdownConverter = require('mark-web-converter');

const converter = new MarkdownConverter({
  input: './docs',
  output: './dist'
});

// 转换所有文件
converter.convertAll();

// 或转换单个文件
converter.convertFile('input.md', 'output.html');
```

## 示例

假设你有以下文档结构：

```
docs/
├── README.md
├── guide/
│   ├── getting-started.md
│   └── advanced.md
└── api/
    └── reference.md
```

在 `README.md` 中的链接：
```markdown
[入门指南](guide/getting-started.md)
[API 参考](api/reference.md)
```

转换后会自动变为：
```html
<a href="guide/getting-started.html">入门指南</a>
<a href="api/reference.html">API 参考</a>
```

## 选项

- `-i, --input <目录>`: 指定输入目录（默认: ./docs）
- `-o, --output <目录>`: 指定输出目录（默认: ./dist）
- `-h, --help`: 显示帮助信息