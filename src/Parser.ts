import TokenStream from './TokenStream';
import { LanguageConfig } from './config';

/**
 * 字面量节点 literal
 * 标识符节点 ident
 * 函数调用节点 call
 * 二元运算符节点 binary
 * 表达式节点 expr
 */

type LiteralNode = {
  type: 'literal';
  value: string;
}

type IdentNode = {
  type: 'ident';
  value: string;
};

type BinaryNode = {
  type: 'binary';
  // eslint-disable-next-line no-use-before-define
  left: ExpressionNode;
  // eslint-disable-next-line no-use-before-define
  right: ExpressionNode;
  op: string;
}

type CallNode = {
  type: 'call';
  // eslint-disable-next-line no-use-before-define
  func: IdentNode;
  // eslint-disable-next-line no-use-before-define
  args: Array<ExpressionNode>;
}

export type ExpressionNode = LiteralNode | IdentNode | CallNode | BinaryNode;

export default class Parser {
  constructor(private input: TokenStream, private languageConfig: LanguageConfig) {
  }

  public parse(): ExpressionNode {
    const { input } = this;
    const result = this.parseExpression();
    if(!input.eof()) {
      throw new Error(`unexpected token: ${input.peek()?.value} ${input.peek()?.startPos}-${input.peek()?.endPos}`);
    }
    return result;
  }

  private delimited(start: string, stop: string, separator: string, parser: () => ExpressionNode): ExpressionNode[] {
    const { input } = this;
    const args: any[] = [];
    let first = true;
    this.skipPunc(start);
    while (!input.eof()) {
      if (this.isPunc(stop)) {
        break;
      }
      if (first) {
        first = false;
      } else {
        this.skipPunc(separator);
      }
      if (this.isPunc(stop)) {
        break;
      }
      args.push(parser());
    }
    this.skipPunc(stop);
    return args;
  }

  private isOp(op?: string) {
    const tok = this.input.peek();
    return tok && tok.type === 'op' && (!op || tok.value === op) && tok;
  }

  private isPunc(punc: string) {
    const { input } = this;
    const token = input.peek();
    return token && token.type === 'punc' && token.value === punc && token;
  }

  private maybeBinary(left: ExpressionNode, prec: number): ExpressionNode {
    const { input, languageConfig } = this;
    const op = this.isOp();
    if (op) {
      const hisPrec = languageConfig.getOperatorPrece(op.value);
      if (hisPrec > prec) {
        input.next();
        const right = this.maybeBinary(this.parseAtom(), hisPrec);
        return this.maybeBinary({
          type: 'binary',
          op: op.value,
          left,
          right
        }, prec);
      }
    }
    return left;
  }

  private maybeCall(ident: ExpressionNode): ExpressionNode {
    return this.isPunc('(') ? this.parseCall(ident) : ident;
  }

  private parseAtom(): ExpressionNode {
    const { input, languageConfig } = this;
    if (this.isPunc('(')) {
      this.skipPunc('(');
      const exp = this.parseExpression();
      this.skipPunc(')');
      return exp;
    }
    const token = input.next();
    if (!token) {
      throw new Error('unexpected end of input');
    }
    if (token.type === 'literal') {
      return {
        type: 'literal',
        value: token.value
      };
    }
    if (token.type === 'ident') {
      if(languageConfig.allowFunction()) {
        return this.maybeCall({
          type: 'ident',
          value: token.value
        });
      } else {
        return {
          type: 'ident',
          value: token.value
        };
      }
    }
    throw new Error(`unexpected token: ${token.type} ${token.startPos}-${token.endPos}`);
  }

  // 解析一个函数调用
  private parseCall(func: any): CallNode {
    return {
      type: 'call',
      func,
      args: this.delimited('(', ')', ',', () => this.parseExpression())
    };
  }

  // 解析一个表达式
  private parseExpression(): ExpressionNode {
    return this.maybeBinary(this.parseAtom(), 0);
  }

  private skipPunc(punc: string): void {
    const { input } = this;
    if (this.isPunc(punc)) {
      input.next();
    } else {
      throw new Error(`unexpected punctuation: ${punc} ${input.peek()?.startPos}-${input.peek()?.endPos}`);
    }
  }
}
