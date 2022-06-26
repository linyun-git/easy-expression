export default class InputStream {
  position: number = 0;
  line: number = 1;
  column: number = 0;

  constructor(private input: string) { }

  next() {
    const ch = this.input[this.position++];
    if (ch === '\n') {
      this.line++;
      this.column = 0;
    } else {
      this.column++;
    }
    return ch;
  }

  peek() {
    return this.input[this.position];
  }

  eof() {
    return this.peek() === undefined;
  }

  croak(msg: string) {
    throw new Error(`${msg} (${this.line}:${this.column})`);
  }

  pos() {
    return {
      line: this.line,
      column: this.column
    };
  }
}
