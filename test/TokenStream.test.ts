import InputStream from '../src/InputStream';
import TokenStream from '../src/TokenStream';
import { LanguageConfig } from '../src/config';

test('read literal', () => {
  const inputStream = new InputStream('1.1. + .2 + "string"');
  const languageConfig = new LanguageConfig({});
  const input = new TokenStream(inputStream, languageConfig);
  expect(input.next()).toEqual({
    type: 'literal',
    value: '1.1',
    startPos: '1:1',
    endPos: '1:3'
  });
  input.next();
  input.next();
  expect(input.next()).toEqual({
    type: 'literal',
    value: '.2',
    startPos: '1:8',
    endPos: '1:9'
  });
  input.next();
  expect(input.next()).toEqual({
    type: 'literal',
    value: '"string"',
    startPos: '1:13',
    endPos: '1:20'
  });
});

test('read punc', () => {
  const inputStream = new InputStream('call(p1, p2, p3)');
  const languageConfig = new LanguageConfig({});
  const input = new TokenStream(inputStream, languageConfig);
  input.next();
  expect(input.next()).toEqual({
    type: 'punc',
    value: '(',
    startPos: '1:5',
    endPos: '1:5'
  });
  input.next();
  expect(input.next()).toEqual({
    type: 'punc',
    value: ',',
    startPos: '1:8',
    endPos: '1:8'
  });
  input.next();
  expect(input.next()).toEqual({
    type: 'punc',
    value: ',',
    startPos: '1:12',
    endPos: '1:12'
  });
  input.next();
  expect(input.next()).toEqual({
    type: 'punc',
    value: ')',
    startPos: '1:16',
    endPos: '1:16'
  });
});

test('read ident', () => {
  const inputStream = new InputStream('name.attr is null');
  const languageConfig = new LanguageConfig({});
  const input = new TokenStream(inputStream, languageConfig);
  expect(input.next()).toEqual({
    type: 'ident',
    value: 'name',
    startPos: '1:1',
    endPos: '1:4'
  });
  input.next();
  expect(input.next()).toEqual({
    type: 'ident',
    value: 'attr',
    startPos: '1:6',
    endPos: '1:9'
  });
  expect(input.next()).toEqual({
    type: 'ident',
    value: 'is',
    startPos: '1:11',
    endPos: '1:12'
  });
  expect(input.next()).toEqual({
    type: 'ident',
    value: 'null',
    startPos: '1:14',
    endPos: '1:17'
  });
});

test('read ident', () => {
  const inputStream = new InputStream('1 + 2.2 - 22 * 3 / 4');
  const languageConfig = new LanguageConfig({});
  const input = new TokenStream(inputStream, languageConfig);
  input.next();
  expect(input.next()).toEqual({
    type: 'op',
    value: '+',
    startPos: '1:3',
    endPos: '1:3'
  });
  input.next();
  expect(input.next()).toEqual({
    type: 'op',
    value: '-',
    startPos: '1:9',
    endPos: '1:9'
  });
  input.next();
  expect(input.next()).toEqual({
    type: 'op',
    value: '*',
    startPos: '1:14',
    endPos: '1:14'
  });
  input.next();
  expect(input.next()).toEqual({
    type: 'op',
    value: '/',
    startPos: '1:18',
    endPos: '1:18'
  });
});

test('test peek', () => {
  const inputStream = new InputStream('two + 1.1');
  const languageConfig = new LanguageConfig({});
  const input = new TokenStream(inputStream, languageConfig);
  expect(input.peek()).toEqual({
    type: 'ident',
    value: 'two',
    startPos: '1:1',
    endPos: '1:3'
  });
  expect(input.peek()).toEqual({
    type: 'ident',
    value: 'two',
    startPos: '1:1',
    endPos: '1:3'
  });
});

test('test next', () => {
  const inputStream = new InputStream('two + 1.1');
  const languageConfig = new LanguageConfig({});
  const input = new TokenStream(inputStream, languageConfig);
  expect(input.next()).toEqual({
    type: 'ident',
    value: 'two',
    startPos: '1:1',
    endPos: '1:3'
  });
  expect(input.next()).toEqual({
    type: 'op',
    value: '+',
    startPos: '1:5',
    endPos: '1:5'
  });
  expect(input.next()).toEqual({
    type: 'literal',
    value: '1.1',
    startPos: '1:7',
    endPos: '1:9'
  });
  expect(input.next()).toBeNull();
});

test('test eof', () => {
  const inputStream = new InputStream('two + 1.1');
  const languageConfig = new LanguageConfig({});
  const input = new TokenStream(inputStream, languageConfig);
  expect(input.eof()).toBe(false);
  input.next();
  expect(input.eof()).toBe(false);
  input.next();
  expect(input.eof()).toBe(false);
  input.next();
  expect(input.eof()).toBe(true);
});

test('custom language', () => {
  const inputStream = new InputStream('1 AND 2 is "12"');
  const languageConfig = new LanguageConfig({
    literals: ['number'],
    operators: [
      {
        token: 'AND',
        precedence: 12
      },
      {
        token: 'is',
        precedence: 11
      }
    ]
  });
  const input = new TokenStream(inputStream, languageConfig);
  expect(input.next()).toEqual({
    type: 'literal',
    value: '1',
    startPos: '1:1',
    endPos: '1:1'
  });
  expect(input.next()).toEqual({
    type: 'op',
    value: 'AND',
    startPos: '1:3',
    endPos: '1:5'
  });
  expect(input.next()).toEqual({
    type: 'literal',
    value: '2',
    startPos: '1:7',
    endPos: '1:7'
  });
  expect(input.next()).toEqual({
    type: 'op',
    value: 'is',
    startPos: '1:9',
    endPos: '1:10'
  });
  expect(() => input.next()).toThrow(Error);
});
