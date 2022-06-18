import InputStream from './InputStream';

/**
 * 表达式内容
 * 字面量: number string
 * 常量: true false null undefined
 * 组合: ( )
 * 运算符:
 *  二元运算符 ( +、-、*、/ )
 *  函数
 */

/**
 * token 类型:
 * punc: 特殊操作符: ( )
 * num: 数字: 1 2 3 4 5 6 7 8 9 0
 * str: 字符串: "hello"
 * ident: 变量名: a b c d e f g h i j k l m n o p q r s t u v w x y z
 * op: 操作符: + - * / = == != < > <= >=
 */

export default class TokenStream {
  constructor(private input: InputStream) {
  }

  public readNext(): any {
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
    if(/[+\-*/=<>!]/.test(ch)) {
      return this.readOp();
    }
    if(/[a-zA-Z_]/.test(ch)) {
      return this.readIdent();
    }
    if(/[()]/.test(ch)) {
      return this.readPunc();
    }
    throw new Error('invalid character');
  }

  private readPunc(): any {
    const input = this.input;
    let punc = '';
    let ch = input.next();
    while(/[()]/.test(ch)) {
      punc += ch;
      ch = input.next();
    }
    return punc;
  }

  private readOp(): any {
    const input = this.input;
    let op = '';
    let ch = input.next();
    while(/[+\-*/=<>!]/.test(ch)) {
      op += ch;
      ch = input.next();
    }
    return op;
  }

  private readIdent(): any {
    const input = this.input;
    let ident = '';
    let ch = input.next();
    while(/[a-zA-Z_]/.test(ch)) {
      ident += ch;
      ch = input.next();
    }
    return ident;
  }

  private isWhitespace(ch: string) {
    return /\s/.test(ch);
  }

  private readComment() {
    const input = this.input;
    input.next();
    this.readWhile(ch => ch !== '\n');
  }

  private readNumber() {
    const input = this.input;
    let dot = false;
    let num = '';
    let ch = input.next();
    while(/[0-9.]/.test(ch)) {
      if(ch === '.') {
        if(dot) {
          throw new Error('invalid number');
        } else {
          dot = true;
        }
      }
      num += ch;
      ch = input.next();
    }
    return parseInt(num);
  }

  private readString() {
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
    return str;
  }

  private readWhile(test: (ch: string) => boolean) {
    const input = this.input;
    let ch = input.next();
    while(test(ch)) {
      ch = input.next();
    }
  }
}
