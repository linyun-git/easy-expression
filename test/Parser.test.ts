import InputStream from '../src/InputStream';
import TokenStream from '../src/TokenStream';
import Parser from '../src/Parser';

test('test parse', () => {
  const parser = new Parser(new TokenStream(new InputStream('two + 1.1')));
  expect(parser.parse()).toEqual({
    type: 'binary',
    left: {
      type: 'ident',
      value: 'two'
    },
    right: {
      type: 'literal',
      value: 1.1
    },
    op: '+'
  });
});

test('test add(a + 1, 1*2*3)', () => {
  const parser = new Parser(new TokenStream(new InputStream('add(a + 1, 1*2*3)')));
  expect(parser.parse()).toEqual({
    type: 'call',
    func: {
      type: 'ident',
      value: 'add'
    },
    args: [
      {
        type: 'binary',
        left: {
          type: 'ident',
          value: 'a'
        },
        right: {
          type: 'literal',
          value: 1
        },
        op: '+'
      },
      {
        type: 'binary',
        left: {
          type: 'binary',
          left: {
            type: 'literal',
            value: 1
          },
          right: {
            type: 'literal',
            value: 2
          },
          op: '*'
        },
        right: {
          type: 'literal',
          value: 3
        },
        op: '*'
      }
    ]
  });
});
