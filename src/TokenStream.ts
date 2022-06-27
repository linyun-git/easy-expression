import InputStream from './InputStream';
import { LanguageConfig } from './config';

/**
 * token 类型:
 *  punc: 特殊操作符: ( ) ,
 *  literal: 字面量: 0-9 "hello"
 *  ident: 变量名: a-z A-Z 0-9 _
 *  op: 操作符: + \ - * > < . ! = % ?
 */

type TokenType = 'punc' | 'literal' | 'ident' | 'op';

type Token = {
  type: TokenType;
  value: string;
  startPos: string;
  endPos: string;
};

export default class TokenStream {
  private current: Token | null = null;
  private lastToken: Token | null = null;

  constructor(private input: InputStream, private languageConfig: LanguageConfig) {
  }

  public last(): Token | null {
    return this.lastToken;
  }

  public peek(): Token | null {
    return this.current || (this.current = this.readNext());
  }

  public next(): Token | null {
    const { current: tok } = this;
    this.current = null;
    this.lastToken = tok || this.readNext();
    return this.lastToken;
  }

  public eof() {
    return this.peek() === null;
  }

  private readNext(): Token | null {
    const { input, languageConfig } = this;
    this.readWhile(this.isWhitespace);
    if(input.eof()) {
      return null;
    }
    const ch = input.peek();
    if(ch === '#') {
      this.readComment();
      return this.readNext();
    }
    // 解析字符串字面量
    if (languageConfig.allowLiteral('string')) {
      if(ch === '"') {
        return this.readString();
      }
    }
    // 解析数字字面量
    if (languageConfig.allowLiteral('number')) {
      if(/[0-9]/.test(ch)) {
        return this.readNumber();
      }
    }
    if(/\./.test(ch)) {
      input.next();
      const next = input.peek();
      input.back();
      if(/[0-9]/.test(next)) {
        return this.readNumber();
      }
    }
    // 解析运算符字面量
    if(/[+/\-*><.!=%?]/.test(ch) && languageConfig.allowOperator(ch)) {
      return this.readOp();
    }
    // 解析标识符
    if(/[a-zA-Z_]/.test(ch)) {
      return this.readIdent();
    }
    // 解析特殊操作符
    if(/[(),]/.test(ch)) {
      const pos = input.pos();
      const punc = input.next();
      return {
        type: 'punc',
        value: punc,
        startPos: pos,
        endPos: pos
      };
    }
    throw new Error(`invalid character: ${ch} ${input.pos()}`);
  }

  private readOp(): Token {
    const { input, languageConfig } = this;
    const startPos = input.pos();
    let lastPos = input.pos();
    let op = input.next();
    while(languageConfig.allowOperator(op + input.peek())) {
      lastPos = input.pos();
      op += input.next();
    }
    return {
      type: 'op',
      value: op,
      startPos,
      endPos: lastPos
    };
  }

  private readIdent(): Token {
    const { input, languageConfig } = this;
    const startPos = input.pos();
    let lastPos = input.pos();
    let ident = input.next();
    while(!input.eof() && /[a-zA-Z_0-9]/.test(input.peek())) {
      lastPos = input.pos();
      ident += input.next();
    }
    // 标识符也允许作为运算符
    return {
      type: languageConfig.allowOperator(ident) ? 'op' : 'ident',
      value: ident,
      startPos,
      endPos: lastPos
    };
  }

  private isWhitespace(ch: string) {
    return /\s/.test(ch);
  }

  private readComment() {
    const { input } = this;
    input.next();
    this.readWhile(ch => ch !== '\n');
  }

  private readNumber(): Token {
    const { input } = this;
    const startPos = input.pos();
    let lastPos = input.pos();
    let num = input.next();
    let hasDot = num === '.';
    while(/[0-9.]/.test(input.peek())) {
      if(input.peek() === '.') {
        if(hasDot) {
          break;
        } else {
          hasDot = true;
        }
      }
      lastPos = input.pos();
      num += input.next();
    }
    return {
      type: 'literal',
      value: num,
      startPos,
      endPos: lastPos
    };
  }

  private readString(): Token {
    const { input } = this;
    const startPos = input.pos();
    let str = input.next();
    while(!input.eof()) {
      if(input.peek() === '\n') {
        throw new Error(`unexpected newline in string ${input.pos()}`);
      }
      const endPos = input.pos();
      const ch = input.peek();
      str += input.next();
      if(ch === '"') {
        return {
          type: 'literal',
          value: str,
          startPos,
          endPos
        };
      }
    }
    throw new Error(`unterminated string literal ${input.pos()}`);
  }

  private readWhile(test: (ch: string) => boolean) {
    const { input } = this;
    while(test(input.peek())) {
      input.next();
    }
  }
}
