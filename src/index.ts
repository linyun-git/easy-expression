import Parser, { ExpressionNode } from './Parser';
import TokenStream from './TokenStream';
import InputStream from './InputStream';
import { LanguageConfig, LanguageConfigParams, RuntimeConfig, RuntimeConfigParams } from './config';

export class Runner {
  private ast: ExpressionNode;
  private runtimeConfig: RuntimeConfig | null = null;
  private evalStack: ExpressionNode[] | null = null;

  constructor(parser: Parser) {
    this.ast = parser.parse();
  }

  run(config: RuntimeConfigParams) {
    this.runtimeConfig = new RuntimeConfig(config);
    this.evalStack = [];
    const result = this.eval(this.ast);
    this.evalStack = null;
    this.runtimeConfig = null;
    return result;
  }

  private eval(node: ExpressionNode) {
    const runtimeConfig = this.runtimeConfig!;
    this.evalStack!.push(node);
    let result: any;
    switch (node.type) {
      case 'literal':
        result = runtimeConfig.handleLiteral(node.value);
        break;
      case 'ident':
        result = runtimeConfig.handleConstant(node.value);
        break;
      case 'call': {
        const args = node.args.map(arg => this.eval(arg));
        result = runtimeConfig.handleFunction(node.func.value, args);
        break;
      }
      case 'binary': {
        const left = this.eval(node.left);
        const right = this.eval(node.right);
        result = runtimeConfig.handleOperator(node.op, [left, right]);
        break;
      }
      default:
        break;
    }
    this.evalStack!.pop();
    return result;
  }
}

export function compile(expression: string, config?: LanguageConfigParams) {
  if (!expression || !expression.trim()) {
    throw new Error('empty expression');
  }
  const languageConfig = new LanguageConfig(config);
  const inputStream = new InputStream(expression);
  const tokenStream = new TokenStream(inputStream, languageConfig);
  const parser = new Parser(tokenStream, languageConfig);
  return new Runner(parser);
}
