import InputStream from '../src/InputStream';
import TokenStream from '../src/TokenStream';

test('test peek', () => {
  const input = new TokenStream(new InputStream('two + 1.1'));
  expect(input.peek()).toEqual({
    type: 'ident',
    value: 'two'
  });
  expect(input.peek()).toEqual({
    type: 'ident',
    value: 'two'
  });
});

test('test next', () => {
  const input = new TokenStream(new InputStream('two + 1.1'));
  expect(input.next()).toEqual({
    type: 'ident',
    value: 'two'
  });
  expect(input.next()).toEqual({
    type: 'op',
    value: '+'
  });
  expect(input.next()).toEqual({
    type: 'num',
    value: 1.1
  });
});

test('test eof', () => {
  const input = new TokenStream(new InputStream('two + 1.1'));
  expect(input.eof()).toBe(false);
  input.next();
  expect(input.eof()).toBe(false);
  input.next();
  expect(input.eof()).toBe(false);
  input.next();
  expect(input.eof()).toBe(true);
});

test('test (1 + 1) + x * (2 - 2)', () => {
  const input = new TokenStream(new InputStream('(1 + 1) + x * (2 - 2)'));
  const tokens: any[] = [];
  while(!input.eof()) {
    tokens.push(input.next());
  }
  expect(tokens).toEqual([
    { type: 'punc', value: '(' },
    { type: 'num', value: 1 },
    { type: 'op', value: '+' },
    { type: 'num', value: 1 },
    { type: 'punc', value: ')' },
    { type: 'op', value: '+' },
    { type: 'ident', value: 'x' },
    { type: 'op', value: '*' },
    { type: 'punc', value: '(' },
    { type: 'num', value: 2 },
    { type: 'op', value: '-' },
    { type: 'num', value: 2 },
    { type: 'punc', value: ')' }
  ]);
});

test('test add(a + 1, 1*2*3)', () => {
  const input = new TokenStream(new InputStream('add(a + 1, 1*2*3)'));
  const tokens: any[] = [];
  while(!input.eof()) {
    tokens.push(input.next());
  }
  expect(tokens).toEqual([
    { type: 'ident', value: 'add' },
    { type: 'punc', value: '(' },
    { type: 'ident', value: 'a' },
    { type: 'op', value: '+' },
    { type: 'num', value: 1 },
    { type: 'punc', value: ',' },
    { type: 'num', value: 1 },
    { type: 'op', value: '*' },
    { type: 'num', value: 2 },
    { type: 'op', value: '*' },
    { type: 'num', value: 3 },
    { type: 'punc', value: ')' }
  ]);
});
