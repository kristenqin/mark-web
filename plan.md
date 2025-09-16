没有 Markdown Linker 这个包 有没有办法自己开发一个这个 node 包来实现这个链接的需求 文档元信息发生变化的时候 使用这个工具来完成对应的重新链接和编译过程
如果 **Markdown Linker** 这个包无法使用，而你有需求自行开发一个类似的工具来实现自动修正和重新编译 Markdown 文件之间的链接，你完全可以使用 **Node.js** 来编写一个自定义工具。这个工具可以在文档元信息（如文件名、目录结构等）发生变化时，自动修复链接并重新编译文件。

### 基本思路

这个工具的基本功能如下：

1. **扫描文件夹**：遍历文件夹中的所有 Markdown 文件，识别文件之间的相对链接。
2. **修复链接**：根据文件路径的变化，自动修复文件中的链接。
3. **重新编译**：当文件内容发生变化时，使用 Pandoc 等工具重新生成 HTML 文件。

### 需要用到的 Node.js 库

- **fs**：读取和写入文件。
- **path**：处理文件路径，帮助生成正确的相对路径。
- **glob**：扫描文件夹，找到所有 Markdown 文件。
- **front-matter**：处理 Markdown 文件的 YAML 前置头部（如标题、日期、分类等）。
- **marked**：将 Markdown 转换为 HTML（用于编译）。
- **cheerio**：解析 HTML，修复文件中的链接。

### 开发步骤

#### 1. 初始化 Node.js 项目

首先，在项目目录下创建一个新的 Node.js 项目。

```bash
mkdir markdown-linker
cd markdown-linker
npm init -y
```

安装需要的依赖：

```bash
npm install glob front-matter marked cheerio
```

#### 2. 解析 Markdown 文件并修复链接

你可以编写一个脚本来扫描所有 Markdown 文件，提取其中的链接，然后根据需要修复链接。

```javascript
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const frontMatter = require("front-matter");
const marked = require("marked");
const cheerio = require("cheerio");

// 扫描文件夹中的所有 Markdown 文件
const markdownFiles = glob.sync("markdown_folder/**/*.md");

// 函数：修复链接
function fixLinks(content, currentFile) {
  const $ = cheerio.load(marked(content)); // 使用 cheerio 解析 HTML
  $("a").each((i, elem) => {
    const href = $(elem).attr("href");
    if (href && href.endsWith(".md")) {
      const resolvedPath = path.resolve(path.dirname(currentFile), href);
      const htmlPath = resolvedPath.replace(".md", ".html");
      $(elem).attr("href", htmlPath);
    }
  });
  return $.html(); // 返回修改后的 HTML 内容
}

// 处理每个 Markdown 文件
markdownFiles.forEach((file) => {
  const fileContent = fs.readFileSync(file, "utf-8");
  const fm = frontMatter(fileContent); // 解析前置元数据

  // 修复 Markdown 文件中的链接
  const updatedContent = fixLinks(fm.body, file);

  // 输出修改后的 HTML 内容
  const outputPath = file.replace(".md", ".html");
  const htmlContent = marked(updatedContent); // 使用 marked 转换 Markdown 为 HTML

  fs.writeFileSync(outputPath, htmlContent, "utf-8");
  console.log(`Processed: ${outputPath}`);
});
```

#### 3. 如何工作：

1. **扫描文件夹**：使用 `glob` 库扫描 `markdown_folder` 文件夹中的所有 Markdown 文件（例如 `*.md`）。
2. **提取元数据和内容**：使用 `front-matter` 库解析每个 Markdown 文件的前置头部和主体内容。
3. **修复链接**：对于每个 Markdown 文件中的链接，使用 `cheerio` 和 `marked` 将其转换为 HTML，修复 Markdown 文件中的链接（如 `.md` 后缀的文件转换为 `.html`）。
4. **输出 HTML 文件**：通过 `marked` 库将修复后的 Markdown 内容编译成 HTML，并保存到文件中。

#### 4. 扩展功能：

- **支持多级目录结构**：你可以根据文件路径的层级关系，确保链接始终保持相对路径，避免绝对路径问题。
- **支持自动编译**：你可以将该工具与 **watch** 功能结合，当文件发生变化时，自动重新编译。
- **支持自定义路径转换规则**：比如，如果你要部署到 GitHub Pages，可以根据需要将路径转换为相对路径或绝对路径。

#### 5. 自动化部署

为了自动化整个流程，可以结合文件系统监听工具，如 `chokidar`，自动监测文件的变化，自动修复链接并重新编译。

安装 `chokidar`：

```bash
npm install chokidar
```

修改脚本，添加文件监听：

```javascript
const chokidar = require("chokidar");

// 监听 markdown_folder 文件夹中的文件变化
chokidar.watch("markdown_folder/**/*.md").on("change", (file) => {
  console.log(`File changed: ${file}`);
  const fileContent = fs.readFileSync(file, "utf-8");
  const fm = frontMatter(fileContent); // 解析前置元数据

  // 修复 Markdown 文件中的链接
  const updatedContent = fixLinks(fm.body, file);

  // 输出修改后的 HTML 内容
  const outputPath = file.replace(".md", ".html");
  const htmlContent = marked(updatedContent); // 使用 marked 转换 Markdown 为 HTML

  fs.writeFileSync(outputPath, htmlContent, "utf-8");
  console.log(`Processed: ${outputPath}`);
});
```

### 6. 使用方式：

1. **编写 Markdown 文件**：将 Markdown 文件放在 `markdown_folder/` 文件夹下，并且可以随时修改文件。
2. **运行脚本**：运行你的 Node.js 脚本，它会处理所有 Markdown 文件，修复链接并生成 HTML 文件。

```bash
node index.js
```

3. **监听文件变化**：如果你使用了 `chokidar`，当你修改 Markdown 文件时，工具会自动修复链接并重新编译生成 HTML 文件。

### 总结

通过这种方式，你可以编写一个自定义的工具来实现 **自动修复 Markdown 文件中的链接**，并根据文档的变化（如路径变化）重新编译 HTML。这个工具使用了 **Node.js**，并结合了 **cheerio**、**marked** 和 **front-matter** 等库来完成这个任务。你可以根据需要扩展功能，比如支持更多的自定义路径规则、自动化部署等。
