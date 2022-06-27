import compile from '../src';

test('test run', () => {
  const runner = compile('1 + 2');
  expect(runner.run()).toBe(3);
});

test('test throw error', () => {
  const runner = compile('add(1, "2")');
  expect(() => runner.run({
    functionHandlers: {
      add(num1, num2) {
        if(typeof num1 !== 'number' || typeof num2 !== 'number') {
          throw new Error('params must be number');
        }
        return num1 + num2;
      }
    }
  })).toThrow('params must be number 1:1-1:11');
});

test('test custom language', () => {
  const runner = compile('TRUE AND FALSE IS Boolean(0)', {
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
  expect(runner.run({
    constants: {
      TRUE: true,
      FALSE: false
    },
    operatorHandlers: {
      'AND'(num1, num2) {
        return num1 && num2;
      },
      'IS'(num1, num2) {
        return num1 === num2;
      }
    },
    functionHandlers: {
      Boolean(arg) {
        return Boolean(arg);
      }
    }
  })).toBe(true);
});

test('test custom literalHandler', () => {
  const runner = compile('1 + 1', {
    operators: [
      {
        token: '+',
        precedence: 12
      }
    ]
  });
  expect(runner.run({
    literalHandler(literal: string) {
      const value = literal.startsWith('"') ? literal.slice(1, literal.length - 1) : Number(literal);
      return {
        type: typeof value,
        value
      };
    },
    operatorHandlers: {
      '+'(p1, p2) {
        const value = p1.value + p2.value;
        return {
          type: typeof value,
          value
        };
      }
    }
  })).toEqual({
    type: 'number',
    value: 2
  });
});
