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
    value: '1.1'
  });
});

test('test ident', () => {
  const inputStream = new InputStream('number');
  const languageConfig = new LanguageConfig({});
  const tokenStream = new TokenStream(inputStream, languageConfig);
  const parser = new Parser(tokenStream, languageConfig);
  expect(parser.parse()).toEqual({
    type: 'ident',
    value: 'number'
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
      value: 'num1'
    },
    right: {
      type: 'ident',
      value: 'num2'
    },
    op: '+'
  });
});

test('test call', () => {
  const inputStream = new InputStream('add(num1, num2)');
  const languageConfig = new LanguageConfig({});
  const tokenStream = new TokenStream(inputStream, languageConfig);
  const parser = new Parser(tokenStream, languageConfig);
  expect(parser.parse()).toEqual({
    type: 'call',
    func: {
      type: 'ident',
      value: 'add'
    },
    args: [
      {
        type: 'ident',
        value: 'num1'
      },
      {
        type: 'ident',
        value: 'num2'
      }
    ]
  });
});

// test('test add(a + 1, 1*2*3)', () => {
//   const parser = new Parser(new TokenStream(new InputStream('add(a + 1, 1*2*3)')));
//   expect(parser.parse()).toEqual({
//     type: 'call',
//     func: {
//       type: 'ident',
//       value: 'add'
//     },
//     args: [
//       {
//         type: 'binary',
//         left: {
//           type: 'ident',
//           value: 'a'
//         },
//         right: {
//           type: 'literal',
//           value: 1
//         },
//         op: '+'
//       },
//       {
//         type: 'binary',
//         left: {
//           type: 'binary',
//           left: {
//             type: 'literal',
//             value: 1
//           },
//           right: {
//             type: 'literal',
//             value: 2
//           },
//           op: '*'
//         },
//         right: {
//           type: 'literal',
//           value: 3
//         },
//         op: '*'
//       }
//     ]
//   });
// });
