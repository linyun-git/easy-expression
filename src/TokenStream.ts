import InputStream from './InputStream';

/**
 * token 类型:
 * punc: 特殊操作符: ( )
 * num: 数字: 1 2 3 4 5 6 7 8 9 0
 * str: 字符串: "hello"
 * ident: 变量名: a b c d e f g h i j k l m n o p q r s t u v w x y z
 * op: 操作符: + - * /
 */

type TokenType = 'punc' | 'num' | 'str' | 'ident' | 'op';

type Token = {
  type: TokenType;
  value: string | number;
};

export default class TokenStream {
  private current: Token | null = null;

  constructor(private input: InputStream) {
  }

  public peek(): Token | null {
    return this.current || (this.current = this.readNext());
  }

  public next(): Token | null {
    const tok = this.current;
    this.current = null;
    return tok || this.readNext();
  }

  public eof() {
    return this.peek() === null;
  }

  private readNext(): Token | null {
    const input = this.input;
    this.readWhile(this.isWhitespace);
    if(input.eof()) {
      return null;
    }
    const ch = input.peek();
    if(ch === '#') {
      this.readComment();
      return this.readNext();
    }
    if(ch === '"') {
      return this.readString();
    }
    if(/[0-9]/.test(ch)) {
      return this.readNumber();
    }
    if(/[+\-*]/.test(ch)) {
      return this.readOp();
    }
    if(/[a-zA-Z_]/.test(ch)) {
      return this.readIdent();
    }
    if(/[(),]/.test(ch)) {
      return {
        type: 'punc',
        value: input.next()
      };
    }
    throw new Error(`invalid character: ${ch}`);
  }

  private readOp(): Token {
    const input = this.input;
    let op = '';
    let ch = input.peek();
    while(/[+\-*]/.test(ch)) {
      op += ch;
      input.next();
      ch = input.peek();
    }
    return {
      type: 'op',
      value: op
    };
  }

  private readIdent(): Token {
    const input = this.input;
    let ident = '';
    let ch = input.peek();
    while(/[a-zA-Z_]/.test(ch)) {
      ident += ch;
      input.next();
      ch = input.peek();
    }
    return {
      type: 'ident',
      value: ident
    };
  }

  private isWhitespace(ch: string) {
    return /\s/.test(ch);
  }

  private readComment() {
    const input = this.input;
    input.next();
    this.readWhile(ch => ch !== '\n');
  }

  private readNumber(): Token {
    const input = this.input;
    let dot = false;
    let num = '';
    let ch = input.peek();
    while(/[0-9.]/.test(ch)) {
      if(ch === '.') {
        if(dot) {
          throw new Error('invalid number');
        } else {
          dot = true;
        }
      }
      num += ch;
      input.next();
      ch = input.peek();
    }
    return {
      type: 'num',
      value: Number(num)
    };
  }

  private readString(): Token {
    const input = this.input;
    input.next();
    let str = '';
    let ch = input.next();
    while(ch !== '"') {
      str += ch;
      ch = input.next();
      if(ch === '\n') {
        throw new Error('unexpected newline in string');
      }
    }
    return {
      type: 'str',
      value: str
    };
  }

  private readWhile(test: (ch: string) => boolean) {
    const input = this.input;
    let ch = input.peek();
    while(test(ch)) {
      input.next();
      ch = input.peek();
    }
  }
}
