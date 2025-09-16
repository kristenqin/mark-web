#!/usr/bin/env node

const MarkdownConverter = require('./index');
const path = require('path');

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: './docs',
    output: './dist'
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '-i':
      case '--input':
        options.input = args[++i];
        break;
      case '-o':
      case '--output':
        options.output = args[++i];
        break;
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
        break;
      default:
        if (arg.startsWith('-')) {
          console.error(`未知选项: ${arg}`);
          showHelp();
          process.exit(1);
        }
        break;
    }
  }
  
  return options;
}

function showHelp() {
  console.log(`
mark-web - 简单的 Markdown 到 HTML 转换工具

用法:
  mark-web [选项]

选项:
  -i, --input <目录>   输入目录 (默认: ./docs)
  -o, --output <目录>  输出目录 (默认: ./dist)
  -h, --help           显示帮助信息

示例:
  mark-web                              # 使用默认设置
  mark-web -i ./markdown -o ./html      # 指定输入输出目录
`);
}

// 主函数
function main() {
  const options = parseArgs();
  
  console.log('mark-web - Markdown 到 HTML 转换工具');
  console.log('=====================================');
  
  const converter = new MarkdownConverter(options);
  converter.convertAll();
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('发生错误:', error.message);
  process.exit(1);
});

main();