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

type Position = {
  line: number;
  column: number;
};

type Token = {
  type: TokenType;
  value: string;
  startPos: Position;
  endPos: Position;
};

export default class TokenStream {
  private current: Token | null = null;

  constructor(private input: InputStream, private languageConfig: LanguageConfig) {
  }

  public peek(): Token | null {
    return this.current || (this.current = this.readNext());
  }

  public next(): Token | null {
    const { current: tok } = this;
    this.current = null;
    return tok || this.readNext();
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
    // 解析运算符字面量
    if(/[+\-*><.!=%?]/.test(ch)) {
      return this.readOp();
    }
    // 解析标识符
    if(/[a-zA-Z_]/.test(ch)) {
      return this.readIdent();
    }
    // 解析特殊操作符
    if(/[(),]/.test(ch)) {
      const punc = input.next();
      const pos = input.pos();
      return {
        type: 'punc',
        value: punc,
        startPos: pos,
        endPos: pos
      };
    }
    throw new Error(`invalid character: ${ch}`);
  }

  private readOp(): Token {
    const { input, languageConfig } = this;
    let op = input.next();
    const startPos = input.pos();
    let ch = input.peek();
    while(languageConfig.allowOperator(op + ch)) {
      input.next();
      op += ch;
      ch = input.peek();
    }
    return {
      type: 'op',
      value: op,
      startPos,
      endPos: input.pos()
    };
  }

  private readIdent(): Token {
    const { input, languageConfig } = this;
    let ident = input.next();
    const startPos = input.pos();
    let ch = input.peek();
    while(/[a-zA-Z_0-9]/.test(ch)) {
      ident += ch;
      input.next();
      ch = input.peek();
    }
    // 标识符也允许作为运算符
    return {
      type: languageConfig.allowOperator(ident) ? 'op' : 'ident',
      value: ident,
      startPos,
      endPos: input.pos()
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
    let dot = false;
    let num = input.next();
    const startPos = input.pos();
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
      type: 'literal',
      value: num,
      startPos,
      endPos: input.pos()
    };
  }

  private readString(): Token {
    const { input } = this;
    let str = input.next();
    const startPos = input.pos();
    let ch = input.next();
    while(ch) {
      str += ch;
      if(ch === '"') {
        return {
          type: 'literal',
          value: str,
          startPos,
          endPos: input.pos()
        };
      }
      ch = input.next();
      if(ch === '\n') {
        throw new Error('unexpected newline in string');
      }
    }
    throw new Error('unterminated string literal');
  }

  private readWhile(test: (ch: string) => boolean) {
    const { input } = this;
    let ch = input.peek();
    while(test(ch)) {
      input.next();
      ch = input.peek();
    }
  }
}
