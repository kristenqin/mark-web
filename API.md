# MarkWeb API 文档

## 概述

MarkWeb 提供了丰富的 API 接口，支持编程方式使用工具的各项功能。本文档详细介绍了所有可用的 API 接口。

## 主要 API

### MarkWeb 类

主要的编译器类，提供核心编译功能。

```javascript
const MarkWeb = require('markweb');

const compiler = new MarkWeb(options);
```

#### 构造函数参数

```javascript
const options = {
  // 输入输出配置
  input: './docs',           // 输入目录
  output: './dist',          // 输出目录
  
  // 样式主题
  style: 'github',           // 'default' | 'github' | 'minimal'
  
  // 功能开关
  features: {
    codeHighlight: true,     // 代码高亮
    math: true,              // 数学公式
    diagrams: true,          // 图表渲染
    toc: true,               // 目录生成
    breadcrumb: true         // 面包屑导航
  },
  
  // Markdown 配置
  markdown: {
    breaks: true,            // 支持换行
    linkify: true,           // 自动链接
    html: true               // 允许 HTML
  },
  
  // 服务器配置
  server: {
    port: 3000,              // 端口号
    host: 'localhost',       // 主机地址
    livereload: true,        // 实时刷新
    open: false              // 自动打开浏览器
  },
  
  // 排除文件
  exclude: [
    'node_modules/**',
    '.git/**',
    '*.tmp.*'
  ]
};
```

#### 方法

##### build()

编译所有 Markdown 文件。

```javascript
const result = await compiler.build();

// 返回值
{
  success: true,           // 编译是否成功
  files: 15,              // 处理的文件数量
  errors: [],             // 错误列表
  warnings: [],           // 警告列表
  duration: 1250,         // 编译耗时（毫秒）
  outputFiles: [          // 输出文件列表
    './dist/index.html',
    './dist/guide/setup.html'
  ]
}
```

##### buildFile(filePath)

编译单个文件。

```javascript
const result = await compiler.buildFile('./docs/readme.md');

// 返回值
{
  success: true,
  inputFile: './docs/readme.md',
  outputFile: './dist/readme.html',
  html: '<html>...</html>',
  metadata: {
    title: 'README',
    description: '项目说明文档'
  },
  links: [
    { href: './guide.html', text: '使用指南' }
  ]
}
```

##### watch(callback)

启动文件监听模式。

```javascript
compiler.watch((event) => {
  console.log(`文件 ${event.file} 发生 ${event.type} 变化`);
});

// 事件类型
{
  type: 'change',         // 'add' | 'change' | 'unlink'
  file: './docs/readme.md',
  timestamp: 1640995200000
}
```

##### serve(options)

启动开发服务器。

```javascript
const server = await compiler.serve({
  port: 3000,
  open: true
});

// 返回值
{
  url: 'http://localhost:3000',
  port: 3000,
  close: () => server.close()    // 关闭服务器的方法
}
```

##### addRenderer(renderer)

添加自定义渲染器。

```javascript
class CustomRenderer {
  process(html, context) {
    // 自定义处理逻辑
    return processedHtml;
  }
  
  getAssets() {
    return {
      css: ['custom.css'],
      js: ['custom.js']
    };
  }
}

compiler.addRenderer(new CustomRenderer());
```

## 核心模块 API

### FileScanner

文件扫描器，用于发现和解析 Markdown 文件。

```javascript
const { FileScanner } = require('markweb/core');

const scanner = new FileScanner({
  input: './docs',
  exclude: ['*.tmp.*']
});
```

#### 方法

##### scan()

扫描所有 Markdown 文件。

```javascript
const result = await scanner.scan();

// 返回值
{
  files: [
    {
      path: './docs/readme.md',
      relativePath: 'readme.md',
      name: 'readme',
      extension: '.md',
      size: 1024,
      modified: 1640995200000,
      frontMatter: {
        title: 'README',
        date: '2024-01-01'
      },
      content: '# README\n\n内容...',
      links: [
        { href: './guide.md', text: '使用指南' }
      ]
    }
  ],
  dependencies: {
    'readme.md': ['guide.md'],
    'guide.md': []
  }
}
```

##### parseFile(filePath)

解析单个文件。

```javascript
const fileInfo = await scanner.parseFile('./docs/readme.md');

// 返回值
{
  path: './docs/readme.md',
  frontMatter: { title: 'README' },
  content: '# README\n\n内容...',
  links: [],
  metadata: {
    wordCount: 150,
    readingTime: 1  // 分钟
  }
}
```

### LinkProcessor

链接处理器，用于修复和处理 Markdown 中的链接。

```javascript
const { LinkProcessor } = require('markweb/core');

const processor = new LinkProcessor({
  baseDir: './docs',
  outputDir: './dist'
});
```

#### 方法

##### processLinks(content, currentFile)

处理文件中的所有链接。

```javascript
const result = processor.processLinks(markdownContent, './docs/readme.md');

// 返回值
{
  content: '处理后的内容',
  links: [
    {
      original: './guide.md',
      resolved: './guide.html',
      type: 'internal',      // 'internal' | 'external' | 'anchor'
      valid: true
    }
  ],
  brokenLinks: [
    {
      href: './missing.md',
      text: '缺失的文件',
      line: 5
    }
  ]
}
```

##### resolveRelativePath(from, to)

解析相对路径。

```javascript
const relativePath = processor.resolveRelativePath(
  './docs/guide/setup.md',
  './docs/readme.md'
);
// 返回: '../readme.html'
```

### HtmlCompiler

HTML 编译器，将 Markdown 转换为 HTML。

```javascript
const { HtmlCompiler } = require('markweb/core');

const compiler = new HtmlCompiler({
  template: './templates/page.html',
  style: 'github'
});
```

#### 方法

##### compile(fileInfo)

编译单个文件。

```javascript
const result = await compiler.compile({
  path: './docs/readme.md',
  content: '# README\n\n内容...',
  frontMatter: { title: 'README' }
});

// 返回值
{
  html: '<html>...</html>',
  metadata: {
    title: 'README',
    description: '自动生成的描述',
    keywords: ['readme', 'documentation']
  },
  assets: {
    css: ['github.css', 'highlight.css'],
    js: ['mermaid.min.js']
  },
  toc: [
    { level: 1, title: 'README', anchor: 'readme' },
    { level: 2, title: '安装', anchor: '安装' }
  ]
}
```

### Watcher

文件监听器，监听文件系统变化。

```javascript
const { Watcher } = require('markweb/core');

const watcher = new Watcher({
  input: './docs',
  compiler: compilerInstance
});
```

#### 方法

##### start()

开始监听文件变化。

```javascript
watcher.start();
```

##### stop()

停止监听。

```javascript
watcher.stop();
```

##### onFileChange(callback)

注册文件变化回调。

```javascript
watcher.onFileChange((event) => {
  console.log('文件变化:', event);
});
```

## 渲染器 API

### BaseRenderer

所有渲染器的基类。

```javascript
const { BaseRenderer } = require('markweb/renderers');

class CustomRenderer extends BaseRenderer {
  process(html, context) {
    // 处理 HTML 内容
    return processedHtml;
  }
  
  getAssets() {
    // 返回需要的资源文件
    return {
      css: ['custom.css'],
      js: ['custom.js']
    };
  }
}
```

### CodeHighlight

代码高亮渲染器。

```javascript
const { CodeHighlight } = require('markweb/renderers');

const renderer = new CodeHighlight({
  languages: ['javascript', 'python', 'css'],
  theme: 'github',
  lineNumbers: true
});
```

### MathRenderer

数学公式渲染器。

```javascript
const { MathRenderer } = require('markweb/renderers');

const renderer = new MathRenderer({
  katex: {
    displayMode: true,
    throwOnError: false
  }
});
```

### DiagramRenderer

图表渲染器。

```javascript
const { DiagramRenderer } = require('markweb/renderers');

const renderer = new DiagramRenderer({
  mermaid: {
    theme: 'default',
    startOnLoad: true
  }
});
```

## 工具函数 API

### PathResolver

路径解析工具。

```javascript
const { PathResolver } = require('markweb/utils');

// 解析相对路径
const relativePath = PathResolver.relative('./docs/a.md', './docs/b.md');

// 规范化路径
const normalized = PathResolver.normalize('./docs/../readme.md');

// 检查文件是否为 Markdown
const isMarkdown = PathResolver.isMarkdown('./readme.md'); // true
```

### Logger

日志工具。

```javascript
const { Logger } = require('markweb/utils');

const logger = new Logger({
  level: 'info',  // 'debug' | 'info' | 'warn' | 'error'
  format: 'pretty'  // 'pretty' | 'json'
});

logger.info('编译开始');
logger.warn('发现损坏的链接');
logger.error('编译失败', error);
```

### ConfigLoader

配置加载器。

```javascript
const { ConfigLoader } = require('markweb/utils');

// 加载配置文件
const config = await ConfigLoader.load('./markweb.config.js');

// 验证配置
const isValid = ConfigLoader.validate(config);

// 合并配置
const merged = ConfigLoader.merge(defaultConfig, userConfig);
```

## 事件系统

MarkWeb 支持事件监听，方便扩展功能。

```javascript
// 监听编译开始
compiler.on('build:start', (files) => {
  console.log(`开始编译 ${files.length} 个文件`);
});

// 监听单个文件编译完成
compiler.on('file:compiled', (result) => {
  console.log(`编译完成: ${result.outputFile}`);
});

// 监听编译完成
compiler.on('build:complete', (result) => {
  console.log(`编译完成，耗时 ${result.duration}ms`);
});

// 监听错误
compiler.on('error', (error) => {
  console.error('编译错误:', error);
});
```

## 错误处理

### 错误类型

```javascript
const { MarkWebError, FileNotFoundError, ParseError } = require('markweb/errors');

// 捕获特定错误
try {
  await compiler.build();
} catch (error) {
  if (error instanceof FileNotFoundError) {
    console.log('文件不存在:', error.filePath);
  } else if (error instanceof ParseError) {
    console.log('解析错误:', error.message);
  }
}
```

### 错误恢复

```javascript
// 设置错误恢复策略
compiler.setErrorHandler({
  onFileError: (error, file) => {
    // 单个文件错误时的处理
    console.warn(`跳过文件 ${file}: ${error.message}`);
    return 'skip'; // 'skip' | 'retry' | 'abort'
  },
  
  onLinkError: (error, link) => {
    // 链接错误时的处理
    console.warn(`损坏的链接: ${link.href}`);
    return 'ignore'; // 'ignore' | 'fix' | 'remove'
  }
});
```

## 插件开发

### 插件接口

```javascript
class MarkWebPlugin {
  constructor(options) {
    this.options = options;
  }
  
  // 插件名称
  get name() {
    return 'custom-plugin';
  }
  
  // 插件初始化
  apply(compiler) {
    // 注册事件监听器
    compiler.on('build:start', this.onBuildStart.bind(this));
    
    // 添加渲染器
    compiler.addRenderer(new CustomRenderer());
  }
  
  onBuildStart(files) {
    console.log('插件开始工作');
  }
}

// 使用插件
compiler.use(new MarkWebPlugin({ option: 'value' }));
```

这个 API 文档为开发者提供了完整的接口说明，便于集成和扩展 MarkWeb 工具。