# ExprJS

可定制化表达式解释器

## 功能

***基本功能***

+ 字面量: number string
+ 组合嵌套: ( )
+ 二元运算符 + - * /
+ 函数: 无预设函数

***可定制化功能***

+ 可选字面量
+ 字面量捕获
+ 注入常量
+ 标识符捕获
+ 注入函数
+ 运算符重载
+ 自定义二元运算符

## 开始使用

安装

``` shell

# 使用npm安装
npm install expr-js --save

# 使用yarn安装
yarn add expr-js

```

表达式解析配置

``` javascript

import compile from 'expr-js';

const runner = compile('2 AND 2 IS MULTIPLE(2, 2)', {
  // 配置二元运算符
  operators: [
    {
      token: 'AND',
      precedence: 12
    },
    {
      token: 'IS',
      precedence: 11
    }
  ]
});

```

表达式执行配置

``` javascript

const result = runner.run({
  // 运算符执行器
  operatorHandlers: {
    'AND'(num1, num2) {
      return num1 && num2;
    },
    'IS'(num1, num2) {
      return num1 === num2;
    }
  },
  // 函数执行器
  functionHandlers: {
    MULTIPLE(num1, num2) {
      return num1 * num2;
    }
  }
});

console.log(result); // true

```

## API

```typescript
// compile
// 解析表达式字符串为抽象语法树，返回执行器

declare function compile(
  expression: string, // 表达式字符串 
  languageConfig?: LanguageConfigParams, // 语法解析配置
): Runner; // 执行器
```

```typescript
// Runner
// 表达式执行器

declare class Runner {
    evalStack: Array<ExpressionNode> | null; // 抽象语法树执行栈
    run(runtimeConfig: RuntimeConfigParams): any; // 执行抽象语法树并返回结果
}
```

```typescript
// config
// 配置

// 表达式解析配置
declare interface LanguageConfigParams {
    literals?: boolean | Array<'number' | 'string'>; // 配置字面量解析，true-默认全部, false-不解析字面量, array-选择解析数字或字符串，默认['number', 'string']
    operators?: boolean | Array<{token: string, precedence: number}>; // 配置运算符，true-使用默认运算符，false-无运算符，array-指定运算符和运算符优先级，默认 + - * /
    allowFunction?: boolean; // 是否支持函数语法，默认true
}

// 表达式执行配置
declare interface RuntimeConfigParams {
    constants?: {[key: string]: any}; // 常量，非运算符及函数的运算符将视为常量
    constantsHandler?: ((token: string) => any) | null; // 常量捕获器，按自定义逻辑解析常量的值，优先级低于constants
	functionHandlers?: {[key: string]: (...params: any[]) => any}; // 函数执行器
	literalHandler?: (literal: string) => any; // 字面量捕获器，按自定义逻辑解析字面量
	operatorHandlers?: {[key: string]: (...params: any[]) => any} // 运算符执行器
}
```

```typescript
// ExpressionNode
// 表达式抽象语法树节点

// 字面量节点
declare type LiteralNode = {
  type: 'literal'; // 类型
  value: string; // 值
  startPos: string; // 节点开始位置
  endPos: string; // 节点结束位置
}

// 标识符节点
declare type IdentNode = {
  type: 'ident';
  value: string;
  startPos: string;
  endPos: string;
};

// 二元运算节点
declare type BinaryNode = {
  type: 'binary';
  left: ExpressionNode; // 左侧节点
  right: ExpressionNode; // 右侧节点
  op: string; // 运算符
  startPos: string;
  endPos: string;
}

// 函数调用节点
declare type CallNode = {
  type: 'call';
  func: string; // 函数
  args: Array<ExpressionNode>; // 参数节点
  startPos: string;
  endPos: string;
}

// 表达式语法树节点
declare type ExpressionNode = LiteralNode | IdentNode | CallNode | BinaryNode;
```