import Parser, { ExpressionNode } from './Parser';

export default class InterPreter {
  ast: ExpressionNode = null!;
  private env: { [key: string]: any } = {};

  constructor(private parser: Parser) {
    this.ast = parser.parse();
  }

  public runWithEnv(env: { [key: string]: any }) {
    this.env = env;
    return this.run();
  }

  public run() {
    return this.eval(this.ast);
  }

  private lookup(envKey) {
    const env = this.env;
    if(envKey in env) {
      return env[envKey];
    }
    throw new Error(`undefined variable ${envKey}`);
  }

  private eval(node: ExpressionNode) {
    switch(node.type) {
      case 'literal':
        return node.value;
      case 'ident':
        return this.lookup(node.value);
      case 'call':{
        const func = this.eval(node.func);
        const args = node.args.map(arg => this.eval(arg));
        return func.apply(null, args);
      }
      case 'binary':{
        const left = this.eval(node.left);
        const right = this.eval(node.right);
        switch(node.op) {
          case '+':
            return left + right;
          case '-':
            return left - right;
          case '*':
            return left * right;
          case '/':
            return left / right;
          default:
            break;
        }
        break;
      }
      default:
        break;
    }
  }
}
