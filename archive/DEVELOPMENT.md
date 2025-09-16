# MarkWeb 开发指南

## 概述

本指南为 MarkWeb 项目的开发者提供详细的开发环境设置、代码结构说明、开发流程和贡献指南。

## 开发环境设置

### 前置要求

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0 或 **yarn** >= 1.22.0
- **Git** >= 2.20.0

### 克隆项目

```bash
git clone https://github.com/example/markweb.git
cd markweb
```

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 开发环境配置

```bash
# 复制环境配置文件
cp .env.example .env

# 编辑环境变量
vim .env
```

### 启动开发服务器

```bash
# 开发模式
npm run dev

# 或
yarn dev
```

## 项目结构详解

```
markweb/
├── .github/                    # GitHub 配置
│   ├── workflows/              # CI/CD 配置
│   └── ISSUE_TEMPLATE/         # Issue 模板
├── bin/                        # 可执行文件
│   └── markweb.js             # CLI 入口
├── src/                        # 源代码
│   ├── index.js               # 主入口
│   ├── cli/                   # 命令行接口
│   │   ├── commands/          # 命令实现
│   │   └── utils/             # CLI 工具
│   ├── core/                  # 核心模块
│   │   ├── FileScanner.js
│   │   ├── LinkProcessor.js
│   │   ├── HtmlCompiler.js
│   │   └── Watcher.js
│   ├── renderers/             # 渲染器
│   ├── server/                # 开发服务器
│   ├── utils/                 # 工具函数
│   └── config/                # 配置管理
├── assets/                    # 静态资源
├── templates/                 # HTML 模板
├── test/                      # 测试文件
│   ├── unit/                  # 单元测试
│   ├── integration/           # 集成测试
│   └── fixtures/              # 测试数据
├── docs/                      # 项目文档
├── examples/                  # 示例项目
├── scripts/                   # 构建脚本
├── .eslintrc.js              # ESLint 配置
├── .prettierrc               # Prettier 配置
├── jest.config.js            # Jest 配置
├── package.json
└── README.md
```

## 核心模块开发

### 1. FileScanner 开发

位置：`src/core/FileScanner.js`

```javascript
const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');
const frontMatter = require('front-matter');

class FileScanner {
  constructor(options = {}) {
    this.options = {
      input: './docs',
      exclude: [],
      ...options
    };
  }

  async scan() {
    const pattern = path.join(this.options.input, '**/*.{md,markdown}');
    const files = await this.globFiles(pattern);
    
    const results = await Promise.all(
      files.map(file => this.parseFile(file))
    );
    
    return {
      files: results,
      dependencies: this.buildDependencyGraph(results)
    };
  }

  async parseFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = frontMatter(content);
      
      return {
        path: filePath,
        relativePath: path.relative(this.options.input, filePath),
        frontMatter: parsed.attributes,
        content: parsed.body,
        links: this.extractLinks(parsed.body),
        stats: await fs.stat(filePath)
      };
    } catch (error) {
      throw new FileProcessingError(`Failed to parse ${filePath}`, error);
    }
  }

  extractLinks(content) {
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;
    
    while ((match = linkPattern.exec(content)) !== null) {
      links.push({
        text: match[1],
        href: match[2],
        line: this.getLineNumber(content, match.index)
      });
    }
    
    return links;
  }
}

module.exports = FileScanner;
```

### 2. 渲染器开发

创建自定义渲染器：

```javascript
// src/renderers/CustomRenderer.js
const BaseRenderer = require('./BaseRenderer');

class CustomRenderer extends BaseRenderer {
  constructor(options = {}) {
    super();
    this.options = options;
  }

  process(html, context) {
    // 自定义处理逻辑
    return this.processCustomElements(html);
  }

  processCustomElements(html) {
    // 处理自定义元素
    return html.replace(
      /::: (\w+)\s*(.*?)\s*:::/gs,
      (match, type, content) => {
        return this.renderCustomBlock(type, content);
      }
    );
  }

  renderCustomBlock(type, content) {
    switch (type) {
      case 'warning':
        return `<div class="warning">${content}</div>`;
      case 'info':
        return `<div class="info">${content}</div>`;
      default:
        return `<div class="custom-${type}">${content}</div>`;
    }
  }

  getAssets() {
    return {
      css: ['custom-renderer.css'],
      js: []
    };
  }
}

module.exports = CustomRenderer;
```

## 测试开发

### 测试结构

```
test/
├── unit/                      # 单元测试
│   ├── core/
│   │   ├── FileScanner.test.js
│   │   ├── LinkProcessor.test.js
│   │   └── HtmlCompiler.test.js
│   ├── renderers/
│   └── utils/
├── integration/               # 集成测试
│   ├── build.test.js
│   └── watch.test.js
└── fixtures/                  # 测试数据
    ├── markdown/
    └── expected/
```

### 单元测试示例

```javascript
// test/unit/core/FileScanner.test.js
const FileScanner = require('../../../src/core/FileScanner');
const fs = require('fs').promises;
const path = require('path');

describe('FileScanner', () => {
  let scanner;
  const testDir = path.join(__dirname, '../../fixtures/markdown');

  beforeEach(() => {
    scanner = new FileScanner({ input: testDir });
  });

  describe('scan()', () => {
    it('should scan all markdown files', async () => {
      const result = await scanner.scan();
      
      expect(result.files).toHaveLength(3);
      expect(result.files[0]).toHaveProperty('path');
      expect(result.files[0]).toHaveProperty('content');
      expect(result.files[0]).toHaveProperty('frontMatter');
    });

    it('should exclude files matching exclude patterns', async () => {
      scanner.options.exclude = ['**/draft-*.md'];
      const result = await scanner.scan();
      
      const draftFiles = result.files.filter(f => 
        path.basename(f.path).startsWith('draft-')
      );
      expect(draftFiles).toHaveLength(0);
    });
  });

  describe('parseFile()', () => {
    it('should parse front matter correctly', async () => {
      const testFile = path.join(testDir, 'with-frontmatter.md');
      const result = await scanner.parseFile(testFile);
      
      expect(result.frontMatter).toEqual({
        title: 'Test Document',
        date: '2024-01-01',
        tags: ['test', 'markdown']
      });
    });

    it('should extract links correctly', async () => {
      const testFile = path.join(testDir, 'with-links.md');
      const result = await scanner.parseFile(testFile);
      
      expect(result.links).toContainEqual({
        text: 'Setup Guide',
        href: './setup.md',
        line: 5
      });
    });
  });
});
```

### 集成测试示例

```javascript
// test/integration/build.test.js
const MarkWeb = require('../../src');
const fs = require('fs').promises;
const path = require('path');
const temp = require('temp').track();

describe('Build Integration', () => {
  let tempDir;
  let outputDir;

  beforeEach(async () => {
    tempDir = temp.mkdirSync('markweb-test');
    outputDir = path.join(tempDir, 'dist');
    
    // 创建测试文件
    await fs.mkdir(path.join(tempDir, 'docs'), { recursive: true });
    await fs.writeFile(
      path.join(tempDir, 'docs', 'index.md'),
      '# Hello World\n\n[Link](./page.md)'
    );
    await fs.writeFile(
      path.join(tempDir, 'docs', 'page.md'),
      '# Page\n\nContent here.'
    );
  });

  afterEach(() => {
    temp.cleanupSync();
  });

  it('should build all files correctly', async () => {
    const compiler = new MarkWeb({
      input: path.join(tempDir, 'docs'),
      output: outputDir
    });

    const result = await compiler.build();

    expect(result.success).toBe(true);
    expect(result.files).toBe(2);

    // 检查输出文件
    const indexHtml = await fs.readFile(
      path.join(outputDir, 'index.html'), 
      'utf-8'
    );
    expect(indexHtml).toContain('<h1>Hello World</h1>');
    expect(indexHtml).toContain('href="./page.html"');
  });
});
```

## 开发工作流

### 1. 分支策略

- **main** - 主分支，稳定版本
- **develop** - 开发分支
- **feature/*** - 功能分支
- **hotfix/*** - 热修复分支

### 2. 开发流程

```bash
# 1. 创建功能分支
git checkout -b feature/new-renderer

# 2. 开发功能
npm run dev  # 启动开发服务器

# 3. 运行测试
npm test

# 4. 代码检查
npm run lint
npm run type-check

# 5. 提交代码
git add .
git commit -m "feat: add new renderer support"

# 6. 推送分支
git push origin feature/new-renderer

# 7. 创建 Pull Request
```

### 3. 代码规范

#### ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error'
  }
};
```

#### Prettier 配置

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### 4. 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

类型：
- **feat** - 新功能
- **fix** - 修复 bug
- **docs** - 文档更新
- **style** - 代码格式调整
- **refactor** - 重构
- **test** - 测试相关
- **chore** - 构建、配置等

示例：
```
feat(renderer): add support for custom containers

Add support for custom container syntax like ::: warning
This allows users to create styled content blocks.

Closes #123
```

## 调试指南

### 1. 启用调试模式

```bash
DEBUG=markweb:* npm run dev
```

### 2. 使用调试器

```javascript
// 在代码中添加断点
debugger;

// 启动调试
node --inspect-brk bin/markweb.js build
```

### 3. 日志调试

```javascript
const debug = require('debug');
const log = debug('markweb:core');

class FileScanner {
  async scan() {
    log('Starting file scan...');
    // 实现代码
    log('Scan completed, found %d files', files.length);
  }
}
```

## 性能优化

### 1. 性能分析

```bash
# 生成性能报告
npm run perf

# 内存使用分析
node --inspect --max-old-space-size=4096 bin/markweb.js build
```

### 2. 缓存策略

```javascript
// 文件内容缓存
class FileCache {
  constructor() {
    this.cache = new Map();
  }

  get(filePath, stats) {
    const cacheKey = `${filePath}:${stats.mtime.getTime()}`;
    return this.cache.get(cacheKey);
  }

  set(filePath, stats, content) {
    const cacheKey = `${filePath}:${stats.mtime.getTime()}`;
    this.cache.set(cacheKey, content);
  }
}
```

### 3. 并行处理

```javascript
// 并行编译文件
async function buildFiles(files) {
  const CONCURRENCY = 4;
  const chunks = chunkArray(files, CONCURRENCY);
  
  for (const chunk of chunks) {
    await Promise.all(chunk.map(file => buildFile(file)));
  }
}
```

## 发布流程

### 1. 版本管理

```bash
# 更新版本号
npm version patch  # 补丁版本
npm version minor  # 次要版本
npm version major  # 主要版本
```

### 2. 发布检查清单

- [ ] 所有测试通过
- [ ] 代码覆盖率达标
- [ ] 文档已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号已更新

### 3. 自动发布

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      - run: npm test
      - run: npm run build
      
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 贡献指南

### 1. 贡献类型

- 🐛 Bug 修复
- ✨ 新功能
- 📝 文档改进
- 🎨 代码风格优化
- ♻️ 重构
- ⚡ 性能优化
- ✅ 测试改进

### 2. 贡献流程

1. **Fork 项目**
2. **创建功能分支**
3. **实现更改**
4. **添加测试**
5. **更新文档**
6. **提交 Pull Request**

### 3. Pull Request 模板

```markdown
## 变更类型
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## 变更说明
简要描述这个 PR 做了什么。

## 测试
描述你如何测试这些变更。

## 检查清单
- [ ] 我的代码遵循项目的代码规范
- [ ] 我进行了自我审查
- [ ] 我添加了相应的测试
- [ ] 新的和现有的单元测试都通过了
- [ ] 我更新了相关文档
```

### 4. Code Review 指南

**作为提交者：**
- 确保 PR 描述清晰
- 保持提交历史整洁
- 及时响应反馈

**作为审查者：**
- 关注代码质量和一致性
- 检查测试覆盖率
- 验证功能的正确性
- 提供建设性反馈

## 故障排除

### 常见开发问题

1. **依赖安装失败**
```bash
# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

2. **测试失败**
```bash
# 运行单个测试文件
npm test -- test/unit/core/FileScanner.test.js

# 监听模式
npm test -- --watch
```

3. **内存不足**
```bash
# 增加内存限制
node --max-old-space-size=4096 bin/markweb.js build
```

### 获取帮助

- 📖 查看文档：[项目文档](./README.md)
- 🐛 报告 Bug：[Issues](https://github.com/example/markweb/issues)
- 💬 讨论：[Discussions](https://github.com/example/markweb/discussions)
- 📧 邮件：markweb@example.com

这个开发指南为 MarkWeb 项目提供了完整的开发环境设置和开发流程说明，帮助新贡献者快速上手项目开发。