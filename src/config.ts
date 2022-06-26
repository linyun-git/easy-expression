
// 字面量
export type Literal = 'number' | 'string';

// 运算符
export interface Operator {
  token: string;
  precedence: number;
};

export interface LanguageConfigParams {
  literals?: boolean | Array<Literal>;
  operators?: boolean | Array<Operator>;
  allowFunction?: boolean;
}

export interface StringMap<T> {
  [key: string]: T;
}

// 运算符捕获器
export interface OperatorHandler {
  (...args: any[]): any;
}

// 字面量捕获器
export interface LiteralHandler {
  (literal: number | string): any;
}

// 函数捕获器
export interface FunctionHandler {
  (...params: any[]): any;
}

// 常量捕获器
export interface ConstantsHandler {
  (token: string): any;
};

export interface RuntimeConfigParams {
  constants?: StringMap<any>;

  constantsHandler?: ConstantsHandler | null;

  functionHandlers?: StringMap<FunctionHandler>;

  literalHandler?: LiteralHandler;

  operatorHandlers?: StringMap<OperatorHandler>;
}

// 语言基本配置
export class LanguageConfig {
  private literals: Array<Literal> = ['number', 'string'];

  private operators: Array<Operator> = [
    {
      token: '+',
      precedence: 12
    },
    {
      token: '-',
      precedence: 12
    },
    {
      token: '*',
      precedence: 13
    },
    {
      token: '/',
      precedence: 13
    }
  ];

  private _allowFunction: boolean = true;

  constructor(config: LanguageConfigParams = {}) {
    const { literals = true, operators = true, allowFunction = true } = config;
    if (!literals) {
      this.literals = [];
    } else if (Array.isArray(literals)) {
      this.literals = literals;
    }
    if (!operators) {
      this.operators = [];
    } else if (Array.isArray(operators)) {
      this.operators = operators;
    }
    this._allowFunction = allowFunction;
  }

  allowLiteral(literal: Literal) {
    return this.literals.includes(literal);
  }

  allowOperator(op: string) {
    return this.operators.some(({ token }) => token === op);
  }

  allowFunction() {
    return this._allowFunction;
  }

  getOperatorPrece(op: string) {
    const operator = this.operators.find(({ token }) => token === op);
    if (!operator) {
      throw new Error(`unknown operator: ${op}`);
    }
    return operator.precedence;
  }
}

// 运行时配置
export class RuntimeConfig {
  private constants: StringMap<any>;

  private constantsHandler: ConstantsHandler | null;

  private functionHandlers: StringMap<FunctionHandler>;

  private literalHandler: LiteralHandler | null;

  private operatorHandlers: StringMap<OperatorHandler> = {
    '+'(num1: any, num2: any) {
      return num1 + num2;
    },
    '-'(num1: any, num2: any) {
      return num1 - num2;
    },
    '*'(num1: any, num2: any) {
      return num1 * num2;
    },
    '/'(num1: any, num2: any) {
      return num1 / num2;
    }
  };

  constructor(config: RuntimeConfigParams = {}) {
    this.constants = config.constants ?? {};
    this.constantsHandler = config.constantsHandler ?? null;
    this.functionHandlers = config.functionHandlers ?? {};
    this.literalHandler = config.literalHandler ?? null;
    this.operatorHandlers = {
      ...this.operatorHandlers,
      ...config.operatorHandlers
    };
  }

  handleLiteral(literal: string) {
    const { literalHandler } = this;
    if (literalHandler) {
      return literalHandler(literal);
    }
    if (literal.startsWith('"')) {
      return literal.slice(1, literal.length - 1);
    }
    return Number(literal);
  }

  handleFunction(name: string, args: any[]) {
    const handler = this.functionHandlers[name];
    if (!handler) {
      throw new Error(`unknown function: ${name}`);
    }
    return handler(...args);
  }

  handleConstant(name: string) {
    const { constants, constantsHandler } = this;
    if (name in this.constants) {
      return constants[name];
    }
    if (constantsHandler) {
      return constantsHandler(name);
    }
    throw new Error(`unknown constant: ${name}`);
  }

  handleOperator(op: string, args: any[]) {
    const handler = this.operatorHandlers[op];
    if (!handler) {
      throw new Error(`unknown operator: ${op}`);
    }
    return handler(...args);
  }
}
