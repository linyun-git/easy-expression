export default class InputStream {
  position: number = 0;
  line: number = 1;
  column: number = 1;
  lastLine: number = null!;
  lastColumn: number = null!;

  constructor(private input: string) { }

  // 回退一个字符
  back() {
    if(!this.lastLine || !this.lastColumn) {
      throw new Error('at the beginning of the string');
    }
    this.position--;
    this.line = this.lastLine;
    this.column = this.lastColumn;
    this.lastLine = null!;
    this.lastColumn = null!;
  }

  // 返回当前位置字符，并将位置向后移动
  next() {
    const ch = this.input[this.position++];
    this.lastLine = this.line;
    this.lastColumn = this.column;
    if (ch === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return ch;
  }

  // 返回当前位置字符
  peek() {
    return this.input[this.position];
  }

  // 当前位置已超出字符串
  eof() {
    return this.peek() === undefined;
  }

  // 返回当前位置
  pos() {
    return `${this.line}:${this.column}`;
  }
}
