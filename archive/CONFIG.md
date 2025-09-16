# MarkWeb 配置指南

## 概述

MarkWeb 提供了灵活的配置系统，支持多种配置方式。本指南详细介绍了所有可用的配置选项和使用方法。

## 配置方式

### 1. 配置文件

在项目根目录创建配置文件，支持多种格式：

#### markweb.config.js (推荐)
```javascript
module.exports = {
  input: './docs',
  output: './dist',
  style: 'github',
  // 其他配置...
};
```

#### markweb.config.json
```json
{
  "input": "./docs",
  "output": "./dist", 
  "style": "github"
}
```

#### package.json
```json
{
  "markweb": {
    "input": "./docs",
    "output": "./dist",
    "style": "github"
  }
}
```

### 2. 命令行参数

```bash
markweb build --input ./docs --output ./dist --style github
```

### 3. 环境变量

```bash
MARKWEB_INPUT=./docs MARKWEB_OUTPUT=./dist markweb build
```

### 4. API 配置

```javascript
const compiler = new MarkWeb({
  input: './docs',
  output: './dist'
});
```

## 完整配置选项

### 基础配置

```javascript
module.exports = {
  // 输入目录 - Markdown 文件所在目录
  input: './docs',
  
  // 输出目录 - 生成的 HTML 文件目录
  output: './dist',
  
  // 样式主题
  style: 'github',  // 'default' | 'github' | 'minimal' | 自定义路径
  
  // 语言设置
  language: 'zh-CN',  // 页面语言
  
  // 基础 URL（用于部署到子目录）
  baseUrl: '/',
  
  // 站点信息
  site: {
    title: '文档站点',
    description: '使用 MarkWeb 构建的文档站点',
    author: '作者名称',
    url: 'https://example.com'
  }
};
```

### 功能配置

```javascript
module.exports = {
  features: {
    // 代码高亮
    codeHighlight: {
      enabled: true,
      theme: 'github',           // 高亮主题
      languages: 'auto',         // 'auto' | ['js', 'python', ...]
      lineNumbers: false,        // 显示行号
      copyButton: true           // 复制按钮
    },
    
    // 数学公式
    math: {
      enabled: true,
      engine: 'katex',           // 'katex' | 'mathjax'
      options: {
        displayMode: true,
        throwOnError: false
      }
    },
    
    // 图表渲染
    diagrams: {
      enabled: true,
      engine: 'mermaid',         // 'mermaid' | 'plantuml'
      theme: 'default',
      config: {
        startOnLoad: true
      }
    },
    
    // 目录生成
    toc: {
      enabled: true,
      depth: 3,                  // 目录深度 1-6
      position: 'right',         // 'left' | 'right' | 'top'
      title: '目录'
    },
    
    // 面包屑导航
    breadcrumb: {
      enabled: true,
      separator: ' / ',
      homeText: '首页'
    },
    
    // 搜索功能
    search: {
      enabled: false,
      engine: 'lunr',            // 'lunr' | 'algolia'
      placeholder: '搜索文档...'
    },
    
    // 页脚
    footer: {
      enabled: true,
      text: '© 2024 MarkWeb. All rights reserved.',
      links: [
        { text: 'GitHub', url: 'https://github.com/example/markweb' }
      ]
    }
  }
};
```

### Markdown 配置

```javascript
module.exports = {
  markdown: {
    // 基础选项
    breaks: true,                // 支持换行
    linkify: true,               // 自动转换链接
    html: true,                  // 允许 HTML 标签
    typographer: true,           // 启用排版优化
    
    // 渲染器选项
    renderer: {
      // 自定义链接渲染
      link: (href, title, text) => {
        if (href.startsWith('http')) {
          return `<a href="${href}" title="${title}" target="_blank" rel="noopener">${text}</a>`;
        }
        return `<a href="${href}" title="${title}">${text}</a>`;
      },
      
      // 自定义图片渲染
      image: (src, title, alt) => {
        return `<img src="${src}" alt="${alt}" title="${title}" loading="lazy">`;
      }
    },
    
    // 插件配置
    plugins: [
      'markdown-it-anchor',      // 标题锚点
      'markdown-it-table-of-contents',
      ['markdown-it-container', 'warning']  // 自定义容器
    ]
  }
};
```

### 文件处理配置

```javascript
module.exports = {
  // 包含文件模式
  include: [
    '**/*.md',
    '**/*.markdown'
  ],
  
  // 排除文件模式
  exclude: [
    'node_modules/**',
    '.git/**',
    '*.tmp.*',
    'draft-*.md'
  ],
  
  // 文件处理选项
  files: {
    // 复制静态资源
    copyAssets: true,
    
    // 图片处理
    images: {
      copy: true,
      optimize: false,           // 图片优化
      formats: ['webp'],         // 转换格式
      sizes: [400, 800, 1200]    // 响应式尺寸
    },
    
    // CSS/JS 文件处理
    assets: {
      minify: false,             // 压缩资源
      inline: false,             // 内联小文件
      cache: true                // 启用缓存
    }
  }
};
```

### 开发服务器配置

```javascript
module.exports = {
  server: {
    // 基础配置
    port: 3000,
    host: 'localhost',
    
    // 实时刷新
    livereload: {
      enabled: true,
      port: 35729,
      delay: 100                 // 刷新延迟(ms)
    },
    
    // 自动打开浏览器
    open: {
      enabled: false,
      browser: 'default',        // 'default' | 'chrome' | 'firefox'
      page: '/'                  // 打开的页面
    },
    
    // 代理配置（用于开发环境）
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    },
    
    // 静态文件服务
    static: {
      directory: './public',
      mount: '/public'
    },
    
    // 中间件
    middleware: [
      // 自定义中间件函数
    ]
  }
};
```

### 构建配置

```javascript
module.exports = {
  build: {
    // 清理输出目录
    clean: true,
    
    // 并行处理
    parallel: true,
    
    // 增量构建
    incremental: true,
    
    // 缓存配置
    cache: {
      enabled: true,
      directory: './.markweb-cache',
      ttl: 86400000              // 缓存时间(ms)
    },
    
    // 压缩配置
    minify: {
      html: false,               // HTML 压缩
      css: false,                // CSS 压缩
      js: false                  // JS 压缩
    },
    
    // 源映射
    sourcemap: false,
    
    // 输出配置
    output: {
      // 文件命名
      filename: '[name].html',
      assetFilename: 'assets/[name].[hash].[ext]',
      
      // 目录结构
      preserveStructure: true,   // 保持目录结构
      flattenOutput: false       // 平铺输出
    }
  }
};
```

### 模板配置

```javascript
module.exports = {
  template: {
    // 页面模板
    page: './templates/page.html',
    
    // 索引页模板
    index: './templates/index.html',
    
    // 404 页面模板
    notFound: './templates/404.html',
    
    // 模板引擎配置
    engine: 'handlebars',        // 'handlebars' | 'ejs' | 'nunjucks'
    
    // 模板变量
    data: {
      siteName: 'MarkWeb 文档',
      version: '1.0.0',
      buildTime: new Date().toISOString()
    },
    
    // 辅助函数
    helpers: {
      formatDate: (date) => new Date(date).toLocaleDateString(),
      uppercase: (str) => str.toUpperCase()
    }
  }
};
```

### 插件配置

```javascript
module.exports = {
  plugins: [
    // 内置插件
    'analytics',               // Google Analytics
    'sitemap',                 // 站点地图
    'rss',                     // RSS 订阅
    
    // 第三方插件
    'markweb-plugin-social',   // 社交分享
    
    // 自定义插件
    {
      name: 'custom-plugin',
      options: {
        key: 'value'
      }
    }
  ],
  
  // 插件具体配置
  pluginOptions: {
    analytics: {
      trackingId: 'UA-XXXXXXXX-X'
    },
    
    sitemap: {
      hostname: 'https://example.com',
      changefreq: 'weekly',
      priority: 0.8
    },
    
    rss: {
      title: 'MarkWeb 文档更新',
      description: '文档更新订阅',
      link: 'https://example.com/rss.xml'
    }
  }
};
```

### 高级配置

```javascript
module.exports = {
  // 钩子函数
  hooks: {
    // 构建前钩子
    beforeBuild: async (config) => {
      console.log('构建开始');
    },
    
    // 文件处理前钩子
    beforeFileProcess: async (file) => {
      // 自定义文件预处理
    },
    
    // 文件处理后钩子
    afterFileProcess: async (file, result) => {
      // 自定义文件后处理
    },
    
    // 构建后钩子
    afterBuild: async (result) => {
      console.log('构建完成');
    }
  },
  
  // 自定义渲染器
  renderers: [
    {
      name: 'custom-renderer',
      handler: (html, context) => {
        // 自定义渲染逻辑
        return processedHtml;
      }
    }
  ],
  
  // 实验性功能
  experimental: {
    webComponents: false,      // Web Components 支持
    serviceWorker: false,      // Service Worker
    pwa: false                 // PWA 支持
  }
};
```

## 配置优先级

配置的优先级从高到低：

1. 命令行参数
2. 环境变量
3. 配置文件 (markweb.config.js)
4. package.json 中的 markweb 字段
5. 默认配置

## 配置验证

MarkWeb 会自动验证配置的有效性：

```javascript
// 自定义配置验证
module.exports = {
  // 配置模式定义
  schema: {
    input: { type: 'string', required: true },
    output: { type: 'string', required: true },
    style: { 
      type: 'string', 
      enum: ['default', 'github', 'minimal'],
      default: 'default'
    }
  }
};
```

## 环境特定配置

```javascript
// markweb.config.js
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  input: './docs',
  output: './dist',
  
  // 开发环境特定配置
  ...(isDev && {
    server: {
      livereload: true,
      open: true
    },
    build: {
      sourcemap: true,
      minify: false
    }
  }),
  
  // 生产环境特定配置
  ...(!isDev && {
    build: {
      minify: true,
      cache: true
    }
  })
};
```

## 配置示例

### 个人博客配置

```javascript
module.exports = {
  input: './posts',
  output: './public',
  style: 'minimal',
  
  site: {
    title: '我的博客',
    description: '个人技术博客',
    author: 'John Doe'
  },
  
  features: {
    codeHighlight: { enabled: true, theme: 'github' },
    math: { enabled: false },
    diagrams: { enabled: false },
    toc: { enabled: true, position: 'right' }
  },
  
  template: {
    data: {
      socialLinks: [
        { name: 'GitHub', url: 'https://github.com/johndoe' },
        { name: 'Twitter', url: 'https://twitter.com/johndoe' }
      ]
    }
  }
};
```

### 项目文档配置

```javascript
module.exports = {
  input: './docs',
  output: './dist',
  style: 'github',
  
  features: {
    codeHighlight: {
      enabled: true,
      languages: ['javascript', 'python', 'bash'],
      lineNumbers: true
    },
    math: { enabled: true },
    diagrams: { enabled: true },
    toc: { enabled: true, depth: 4 },
    search: { enabled: true }
  },
  
  build: {
    parallel: true,
    cache: true
  },
  
  server: {
    port: 3000,
    livereload: true
  }
};
```

### 企业文档配置

```javascript
module.exports = {
  input: './enterprise-docs',
  output: './public',
  style: './themes/corporate',
  
  site: {
    title: '企业文档中心',
    description: '企业内部文档管理系统'
  },
  
  features: {
    codeHighlight: { enabled: true },
    search: { enabled: true, engine: 'algolia' },
    breadcrumb: { enabled: true },
    footer: {
      enabled: true,
      text: '© 2024 企业名称. 内部文档.',
      links: [
        { text: '支持', url: '/support' },
        { text: '反馈', url: '/feedback' }
      ]
    }
  },
  
  build: {
    minify: true,
    cache: true
  },
  
  plugins: ['analytics', 'sitemap']
};
```

## 故障排除

### 常见配置错误

1. **路径错误**
```javascript
// 错误 - 使用了不存在的路径
input: './docs-folder'  // 目录不存在

// 正确
input: './docs'
```

2. **样式主题错误**
```javascript
// 错误 - 不支持的主题
style: 'unknown-theme'

// 正确
style: 'github'  // 或自定义路径 './themes/custom.css'
```

3. **插件配置错误**
```javascript
// 错误 - 插件名称错误
plugins: ['non-existent-plugin']

// 正确
plugins: ['analytics', 'sitemap']
```

### 配置调试

启用详细输出查看配置信息：

```bash
markweb build --verbose
```

或在配置文件中启用调试：

```javascript
module.exports = {
  debug: true,
  // 其他配置...
};
```

这个配置指南涵盖了 MarkWeb 的所有配置选项，帮助用户根据需求定制工具行为。