import InputStream from '../src/InputStream';
import TokenStream from '../src/TokenStream';
import { LanguageConfig } from '../src/config';
import Parser from '../src/Parser';

test('test literal', () => {
  const inputStream = new InputStream('1.1');
  const languageConfig = new LanguageConfig({});
  const tokenStream = new TokenStream(inputStream, languageConfig);
  const parser = new Parser(tokenStream, languageConfig);
  expect(parser.parse()).toEqual({
    type: 'literal',
    value: '1.1',
    startPos: '1:1',
    endPos: '1:3'
  });
});

test('test ident', () => {
  const inputStream = new InputStream('number');
  const languageConfig = new LanguageConfig({});
  const tokenStream = new TokenStream(inputStream, languageConfig);
  const parser = new Parser(tokenStream, languageConfig);
  expect(parser.parse()).toEqual({
    type: 'ident',
    value: 'number',
    startPos: '1:1',
    endPos: '1:6'
  });
});

test('test binary', () => {
  const inputStream = new InputStream('num1 + num2');
  const languageConfig = new LanguageConfig({});
  const tokenStream = new TokenStream(inputStream, languageConfig);
  const parser = new Parser(tokenStream, languageConfig);
  expect(parser.parse()).toEqual({
    type: 'binary',
    left: {
      type: 'ident',
      value: 'num1',
      startPos: '1:1',
      endPos: '1:4'
    },
    right: {
      type: 'ident',
      value: 'num2',
      startPos: '1:8',
      endPos: '1:11'
    },
    op: '+',
    startPos: '1:1',
    endPos: '1:11'
  });
});

test('test call', () => {
  const inputStream = new InputStream('add(num1, num2)');
  const languageConfig = new LanguageConfig({});
  const tokenStream = new TokenStream(inputStream, languageConfig);
  const parser = new Parser(tokenStream, languageConfig);
  expect(parser.parse()).toEqual({
    type: 'call',
    func: 'add',
    args: [
      {
        type: 'ident',
        value: 'num1',
        startPos: '1:5',
        endPos: '1:8'
      },
      {
        type: 'ident',
        value: 'num2',
        startPos: '1:11',
        endPos: '1:14'
      }
    ],
    startPos: '1:1',
    endPos: '1:15'
  });
});

test('test punc', () => {
  const inputStream = new InputStream('(add(num1, num2) + 1) * 2');
  const languageConfig = new LanguageConfig({});
  const tokenStream = new TokenStream(inputStream, languageConfig);
  const parser = new Parser(tokenStream, languageConfig);
  expect(parser.parse()).toEqual({
    type: 'binary',
    left: {
      type: 'binary',
      left: {
        type: 'call',
        func: 'add',
        args: [
          {
            type: 'ident',
            value: 'num1',
            startPos: '1:6',
            endPos: '1:9'
          },
          {
            type: 'ident',
            value: 'num2',
            startPos: '1:12',
            endPos: '1:15'
          }
        ],
        startPos: '1:2',
        endPos: '1:16'
      },
      right: {
        type: 'literal',
        value: '1',
        startPos: '1:20',
        endPos: '1:20'
      },
      op: '+',
      startPos: '1:2',
      endPos: '1:20'
    },
    right: {
      type: 'literal',
      value: '2',
      startPos: '1:25',
      endPos: '1:25'
    },
    op: '*',
    startPos: '1:2',
    endPos: '1:25'
  });
});

test('test precedence', () => {
  const inputStream = new InputStream('1 + 1 * 2');
  const languageConfig = new LanguageConfig({});
  const tokenStream = new TokenStream(inputStream, languageConfig);
  const parser = new Parser(tokenStream, languageConfig);
  expect(parser.parse()).toEqual({
    type: 'binary',
    left: {
      type: 'literal',
      value: '1',
      startPos: '1:1',
      endPos: '1:1'
    },
    right: {
      type: 'binary',
      left: {
        type: 'literal',
        value: '1',
        startPos: '1:5',
        endPos: '1:5'
      },
      right: {
        type: 'literal',
        value: '2',
        startPos: '1:9',
        endPos: '1:9'
      },
      op: '*',
      startPos: '1:5',
      endPos: '1:9'
    },
    op: '+',
    startPos: '1:1',
    endPos: '1:9'
  });
});

test('test custom language', () => {
  const inputStream = new InputStream('1 AND 1 IS 2');
  const languageConfig = new LanguageConfig({
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
  const tokenStream = new TokenStream(inputStream, languageConfig);
  const parser = new Parser(tokenStream, languageConfig);
  expect(parser.parse()).toEqual({
    type: 'binary',
    left: {
      type: 'binary',
      left: {
        type: 'literal',
        value: '1',
        startPos: '1:1',
        endPos: '1:1'
      },
      right: {
        type: 'literal',
        value: '1',
        startPos: '1:7',
        endPos: '1:7'
      },
      op: 'AND',
      startPos: '1:1',
      endPos: '1:7'
    },
    right: {
      type: 'literal',
      value: '2',
      startPos: '1:12',
      endPos: '1:12'
    },
    op: 'IS',
    startPos: '1:1',
    endPos: '1:12'
  });
});

test("test don't allow function", () => {
  const inputStream = new InputStream('1 AND 1 IS ADD(1, 1)');
  const languageConfig = new LanguageConfig({
    operators: [
      {
        token: 'AND',
        precedence: 12
      },
      {
        token: 'IS',
        precedence: 11
      }
    ],
    allowFunction: false
  });
  const tokenStream = new TokenStream(inputStream, languageConfig);
  const parser = new Parser(tokenStream, languageConfig);
  expect(() => parser.parse()).toThrow('unexpected token: ( 1:15-1:15');
});
