import InputStream from '../src/InputStream';
import TokenStream from '../src/TokenStream';
import Parser from '../src/Parser';
import InterPreter from '../src/Interpreter';

test('test run', () => {
  const interpreter = new InterPreter(new Parser(new TokenStream(new InputStream('1 + 1 * 2'))));
  expect(interpreter.run()).toBe(3);
});

test('test runWithEnv', () => {
  const interpreter = new InterPreter(new Parser(new TokenStream(new InputStream('add(a + 1, 1*2*3)'))));
  expect(interpreter.runWithEnv({
    a: 10,
    add: (a, b) => a + b
  })).toBe(17);
});

test('test nested func', () => {
  const interpreter = new InterPreter(new Parser(new TokenStream(new InputStream('add(add(a, 1), 1*2*3)'))));
  expect(interpreter.runWithEnv({
    a: 10,
    add: (a, b) => a + b
  })).toBe(17);
});
