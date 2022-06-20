import TokenStream from './TokenStream';

/**
 * 字面量节点 literal
 * 标识符节点 ident
 * 函数调用节点 call
 * 二元运算符节点 binary
 * 表达式节点 expr
 */

type LiteralNode = {
  type: 'literal';
  value: number | string;
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

const PRECEDENCE = {
  '=': 1,
  '||': 2,
  '&&': 3,
  '<': 7,
  '>': 7,
  '<=': 7,
  '>=': 7,
  '==': 7,
  '!=': 7,
  '+': 10,
  '-': 10,
  '*': 20,
  '/': 20,
  '%': 20
};

export default class Parser {
  constructor(private input: TokenStream) {
  }

  public parse(): ExpressionNode {
    return this.parseExpression();
  }

  private delimited(start: string, stop: string, separator: string, parser: () => ExpressionNode): ExpressionNode[] {
    const input = this.input;
    const args: any[] = [];
    let first = true;
    this.skipPunc(start);
    while(!input.eof()) {
      if(this.isPunc(stop)) {
        break;
      }
      if(first) {
        first = false;
      } else {
        this.skipPunc(separator);
      }
      if(this.isPunc(stop)) {
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
    const input = this.input;
    const token = input.peek();
    return token && token.type === 'punc' && token.value === punc && token;
  }

  private maybeBinary(left: ExpressionNode, prec: number): ExpressionNode {
    const input = this.input;
    const op = this.isOp();
    if(op) {
      const hisPrec = PRECEDENCE[op.value as '+' | '-'];
      if(hisPrec > prec) {
        input.next();
        const right = this.maybeBinary(this.parseAtom(), hisPrec);
        return this.maybeBinary({
          type: 'binary',
          op: op.value as string,
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
    const input = this.input;
    if(this.isPunc('(')) {
      this.skipPunc('(');
      const exp = this.parseExpression();
      this.skipPunc(')');
      return exp;
    }
    const token = input.next();
    if(!token) {
      throw new Error('Unexpected end of input');
    }
    if (token.type === 'num' || token.type === 'str') {
      return {
        type: 'literal',
        value: token.value
      };
    }
    if(token.type === 'ident') {
      return this.maybeCall({
        type: 'ident',
        value: token.value as string
      });
    }
    throw new Error(`Unexpected token: ${token.type}`);
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
    const input = this.input;
    if(this.isPunc(punc)) {
      input.next();
    } else {
      throw new Error(`Expected punctuation: ${punc}`);
    }
  }
}
