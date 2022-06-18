# ExpressionJs

可定制化表达式解释器

## 功能

***基本功能***

+ 字面量: number string
+ 组合嵌套: ( )
+ 二元运算符 + - * /
+ 函数: 无预设函数

***可定制化功能***

+ 可选字面量
+ 注入常量
+ 注入函数
+ 运算符重载
+ 自定义二元运算符

## 开始使用

安装ExpressionJs

``` shell

# 使用npm安装
npm install expression-js --save

# 使用yarn安装
yarn add expression-js

```

实例化自定义表达式解释器

``` javascript

import ExpressionJS from 'expression-js';

const MyInterpreter = new ExpressionJs({
  preset: {
    literal: ['number'], // 只支持数字类型的字面量
    operator: false, // 不预置运算符
    function: true, // 支持函数
  },
  custom: {
    constant: {
      // 常量 TRUE
      TRUE: true,
      // 常量 FALSE
      FALSE: false,
    },
    operator: {
      // 自定义运算符 AND
      AND(num1, num2) {
        if(typeof num1 !== 'number' || typeof num2 !== 'number') {
          throw new Error('只接受数字类型的传参');
        }
        return num1 + num2;
      },
      // 自定义运算符 IS
      IS(num1, num2) {
        return num1 == num2;
      }
    },
    function: {
      // 自定义运算符 MULTIPLE
      MULTIPLE(num1, num2) {
        if(arguments.length !== 2) {
          throw new Error('参数个数不正确');
        }
        if(typeof num1 !== 'number' || typeof num2 !== 'number') {
          throw new Error('只接受数字类型的传参');
        }
        return num1 * num2;
      },
    }
  }
});

```

执行表达式

``` javascript

MyInterpreter.exec('TRUE IS FALSE'); // false
MyInterpreter.exec('2 AND 2 IS MULTIPLE(2, 2)'); // true
MyInterpreter.exec('MULTIPLE(TRUE, 2)'); // Error: 只接受数字类型的传参 1:1-1:17

```
