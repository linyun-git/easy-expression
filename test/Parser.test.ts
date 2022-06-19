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
