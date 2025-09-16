# MarkWeb 项目设计文档

## 项目架构概览

MarkWeb 是一个基于 Node.js 的 Markdown 文档编译工具，专注于生成高质量的 HTML 文件供浏览器渲染。

### 设计原则

1. **简洁性** - 专注于核心功能，避免功能膨胀
2. **可扩展性** - 模块化设计，便于功能扩展
3. **性能优先** - 增量编译，智能缓存
4. **用户友好** - 简单的配置，清晰的错误信息

## 项目结构

```
markweb/
├── package.json
├── README.md
├── DESIGN.md                   # 本设计文档
├── src/
│   ├── index.js                # 主入口文件
│   ├── core/                   # 核心模块
│   │   ├── FileScanner.js      # 文件扫描器
│   │   ├── LinkProcessor.js    # 链接处理器
│   │   ├── HtmlCompiler.js     # HTML 编译器
│   │   └── Watcher.js          # 文件监听器
│   ├── renderers/              # 渲染器模块
│   │   ├── CodeHighlight.js    # 代码高亮渲染器
│   │   ├── MathRenderer.js     # 数学公式渲染器
│   │   └── DiagramRenderer.js  # 图表渲染器
│   ├── server/                 # 开发服务器
│   │   └── DevServer.js        # 开发服务器实现
│   ├── utils/                  # 工具模块
│   │   ├── PathResolver.js     # 路径解析工具
│   │   ├── Logger.js           # 日志工具
│   │   └── ConfigLoader.js     # 配置加载器
│   └── config/
│       └── defaults.js         # 默认配置
├── assets/                     # 静态资源
│   ├── css/
│   │   ├── default.css         # 默认样式
│   │   ├── github.css          # GitHub 风格样式
│   │   └── highlight.css       # 代码高亮样式
│   └── js/
│       ├── livereload.js       # 实时刷新脚本
│       └── toc.js              # 目录生成脚本
├── templates/                  # HTML 模板
│   ├── page.html               # 页面模板
│   └── index.html              # 索引页模板
├── bin/
│   └── markweb.js              # CLI 命令入口
├── test/                       # 测试文件
└── examples/                   # 示例文档
```

## 核心模块设计

### 1. FileScanner (文件扫描器)

**职责：**
- 递归扫描指定目录下的 Markdown 文件
- 提取文件元数据（front-matter）
- 建立文件依赖关系图
- 支持文件过滤和排除规则

**接口设计：**
```javascript
class FileScanner {
  constructor(options) {
    this.inputDir = options.input;
    this.excludePatterns = options.exclude || [];
  }
  
  async scan() {
    // 返回文件列表和依赖关系
    return {
      files: [],      // 文件信息数组
      dependencies: {}  // 文件依赖关系
    };
  }
  
  async parseFile(filePath) {
    // 解析单个文件，返回元数据和内容
    return {
      path: filePath,
      frontMatter: {},
      content: '',
      links: []
    };
  }
}
```

### 2. LinkProcessor (链接处理器)

**职责：**
- 解析 Markdown 中的各种链接格式
- 计算相对路径关系
- 修复无效或过时的链接
- 生成链接映射表

**接口设计：**
```javascript
class LinkProcessor {
  constructor(options) {
    this.baseDir = options.baseDir;
    this.outputDir = options.outputDir;
  }
  
  processLinks(content, currentFile) {
    // 处理文件中的所有链接
    return {
      content: '',      // 处理后的内容
      externalLinks: [], // 外部链接列表
      brokenLinks: []   // 损坏的链接列表
    };
  }
  
  resolveRelativePath(from, to) {
    // 解析相对路径
    return relativePath;
  }
}
```

### 3. HtmlCompiler (HTML 编译器)

**职责：**
- 将 Markdown 转换为 HTML
- 集成各种渲染器
- 应用 HTML 模板
- 生成最终的 HTML 文件

**接口设计：**
```javascript
class HtmlCompiler {
  constructor(options) {
    this.renderer = new marked.Renderer();
    this.renderers = []; // 渲染器链
    this.template = options.template;
  }
  
  async compile(fileInfo) {
    // 编译单个文件
    return {
      html: '',         // 生成的 HTML
      assets: [],       // 依赖的资源文件
      metadata: {}      // 页面元数据
    };
  }
  
  addRenderer(renderer) {
    // 添加渲染器到处理链
    this.renderers.push(renderer);
  }
}
```

### 4. Watcher (文件监听器)

**职责：**
- 监听文件系统变化
- 触发增量编译
- 管理编译队列
- 通知开发服务器

**接口设计：**
```javascript
class Watcher {
  constructor(options) {
    this.inputDir = options.input;
    this.compiler = options.compiler;
    this.callbacks = [];
  }
  
  start() {
    // 开始监听文件变化
  }
  
  stop() {
    // 停止监听
  }
  
  onFileChange(callback) {
    // 注册文件变化回调
    this.callbacks.push(callback);
  }
}
```

## 渲染器架构

### 渲染器接口

所有渲染器都实现统一的接口：

```javascript
class BaseRenderer {
  process(html, context) {
    // 处理 HTML 内容
    return processedHtml;
  }
  
  getAssets() {
    // 返回渲染器需要的资源文件
    return {
      css: [],
      js: []
    };
  }
}
```

### 1. CodeHighlight (代码高亮)

```javascript
class CodeHighlight extends BaseRenderer {
  constructor(options = {}) {
    super();
    this.languages = options.languages || 'auto';
    this.theme = options.theme || 'default';
  }
  
  process(html, context) {
    return html.replace(
      /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
      (match, lang, code) => {
        const highlighted = hljs.highlight(code, { language: lang });
        return `<pre><code class="hljs language-${lang}">${highlighted.value}</code></pre>`;
      }
    );
  }
}
```

### 2. MathRenderer (数学公式)

```javascript
class MathRenderer extends BaseRenderer {
  constructor(options = {}) {
    super();
    this.katexOptions = options.katex || {};
  }
  
  process(html, context) {
    // 处理行内公式 $...$
    html = html.replace(/\$([^$]+)\$/g, (match, formula) => {
      return katex.renderToString(formula, { 
        ...this.katexOptions, 
        displayMode: false 
      });
    });
    
    // 处理块级公式 $$...$$
    html = html.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
      return katex.renderToString(formula, { 
        ...this.katexOptions, 
        displayMode: true 
      });
    });
    
    return html;
  }
}
```

### 3. DiagramRenderer (图表渲染)

```javascript
class DiagramRenderer extends BaseRenderer {
  process(html, context) {
    // 将 mermaid 代码块转换为图表容器
    return html.replace(
      /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
      '<div class="mermaid">$1</div>'
    );
  }
  
  getAssets() {
    return {
      js: ['https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js']
    };
  }
}
```

## 模板系统

### 页面模板 (templates/page.html)

```html
<!DOCTYPE html>
<html lang="{{language}}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{title}}</title>
  <meta name="description" content="{{description}}">
  
  <!-- 样式文件 -->
  <link rel="stylesheet" href="{{cssPath}}">
  {{#each additionalCss}}
  <link rel="stylesheet" href="{{this}}">
  {{/each}}
  
  <!-- 数学公式支持 -->
  {{#if hasMath}}
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
  {{/if}}
</head>
<body>
  <div class="container">
    <!-- 导航栏 -->
    {{#if showBreadcrumb}}
    <nav class="breadcrumb">
      {{#each breadcrumb}}
      <a href="{{url}}">{{title}}</a>
      {{#unless @last}} / {{/unless}}
      {{/each}}
    </nav>
    {{/if}}
    
    <!-- 主要内容 -->
    <main class="content">
      {{#if showToc}}
      <aside class="toc">
        {{{tableOfContents}}}
      </aside>
      {{/if}}
      
      <article>
        {{{content}}}
      </article>
    </main>
  </div>
  
  <!-- JavaScript 文件 -->
  {{#each additionalJs}}
  <script src="{{this}}"></script>
  {{/each}}
  
  <!-- 图表支持 -->
  {{#if hasDiagrams}}
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({startOnLoad: true});</script>
  {{/if}}
  
  <!-- 实时刷新 -->
  {{#if isDev}}
  <script src="/livereload.js"></script>
  {{/if}}
</body>
</html>
```

## 配置系统

### 默认配置 (src/config/defaults.js)

```javascript
module.exports = {
  input: './docs',
  output: './dist',
  style: 'default',
  
  features: {
    codeHighlight: true,
    math: true,
    diagrams: true,
    toc: true,
    breadcrumb: true
  },
  
  markdown: {
    breaks: true,
    linkify: true,
    html: true
  },
  
  server: {
    port: 3000,
    host: 'localhost',
    livereload: true,
    open: false
  },
  
  exclude: [
    'node_modules/**',
    '.git/**',
    '*.tmp.*'
  ],
  
  assets: {
    copyImages: true,
    optimizeImages: false
  }
};
```

## 开发服务器

### DevServer 实现

```javascript
class DevServer {
  constructor(options) {
    this.port = options.port || 3000;
    this.host = options.host || 'localhost';
    this.outputDir = options.outputDir;
    this.livereload = options.livereload;
  }
  
  async start() {
    // 启动静态文件服务器
    this.server = express();
    
    // 静态文件服务
    this.server.use(express.static(this.outputDir));
    
    // 实时刷新支持
    if (this.livereload) {
      this.setupLivereload();
    }
    
    // 启动服务器
    this.server.listen(this.port, this.host, () => {
      console.log(`开发服务器启动: http://${this.host}:${this.port}`);
    });
  }
  
  setupLivereload() {
    // WebSocket 连接处理实时刷新
  }
  
  reload() {
    // 触发浏览器刷新
  }
}
```

## 性能优化策略

### 1. 增量编译
- 文件变化检测
- 依赖关系分析
- 智能重新编译

### 2. 缓存机制
- 文件内容哈希
- 编译结果缓存
- 资源文件缓存

### 3. 并行处理
- 多文件并行编译
- 异步 I/O 操作
- Worker 线程支持

## 错误处理

### 错误类型分类
1. **配置错误** - 无效的配置参数
2. **文件错误** - 文件不存在或无法访问
3. **解析错误** - Markdown 语法错误
4. **链接错误** - 损坏的链接引用
5. **编译错误** - HTML 生成失败

### 错误恢复策略
- 优雅降级
- 部分编译继续
- 详细错误报告
- 修复建议提示

## 扩展点设计

### 1. 渲染器插件
- 统一的渲染器接口
- 渲染器注册机制
- 渲染器配置选项

### 2. 主题系统
- CSS 主题切换
- 模板自定义
- 资源文件管理

### 3. 钩子系统
- 编译前后钩子
- 文件处理钩子
- 自定义处理逻辑

这个设计文档为 MarkWeb 项目提供了完整的技术架构指导，确保项目的可维护性和可扩展性。