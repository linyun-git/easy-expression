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
  startPos: string;
  endPos: string;
}

type IdentNode = {
  type: 'ident';
  value: string;
  startPos: string;
  endPos: string;
};

type BinaryNode = {
  type: 'binary';
  // eslint-disable-next-line no-use-before-define
  left: ExpressionNode;
  // eslint-disable-next-line no-use-before-define
  right: ExpressionNode;
  op: string;
  startPos: string;
  endPos: string;
}

type CallNode = {
  type: 'call';
  // eslint-disable-next-line no-use-before-define
  func: string;
  // eslint-disable-next-line no-use-before-define
  args: Array<ExpressionNode>;
  startPos: string;
  endPos: string;
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
          right,
          startPos: left.startPos,
          endPos: right.endPos
        }, prec);
      }
    }
    return left;
  }

  private maybeCall(ident: IdentNode): ExpressionNode {
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
    const token = input.peek();
    if (!token) {
      const lastToken = input.last()!;
      throw new Error(`unexpected end of input ${lastToken.startPos}-${lastToken.endPos}`);
    }
    input.next();
    if (token.type === 'literal') {
      return {
        type: 'literal',
        value: token.value,
        startPos: token.startPos,
        endPos: token.endPos
      };
    }
    if (token.type === 'ident') {
      if(languageConfig.allowFunction()) {
        return this.maybeCall({
          type: 'ident',
          value: token.value,
          startPos: token.startPos,
          endPos: token.endPos
        });
      } else {
        return {
          type: 'ident',
          value: token.value,
          startPos: token.startPos,
          endPos: token.endPos
        };
      }
    }
    throw new Error(`unexpected token: ${token.value} ${token.startPos}-${token.endPos}`);
  }

  // 解析一个函数调用
  private parseCall(funcIdent: IdentNode): CallNode {
    const { input } = this;
    return {
      type: 'call',
      func: funcIdent.value,
      args: this.delimited('(', ')', ',', () => this.parseExpression()),
      startPos: funcIdent.startPos,
      endPos: input.last()!.endPos
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
      throw new Error(`unexpected punctuation: ${punc} ${input.last()?.startPos}-${input.last()?.endPos}`);
    }
  }
}
