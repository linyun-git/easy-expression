import InputStream from '../src/InputStream';

test('test peek', () => {
  const input = new InputStream('abc');
  expect(input.peek()).toBe('a');
  expect(input.peek()).toBe('a');
});

test('test next', () => {
  const input = new InputStream('abc');
  expect(input.next()).toBe('a');
  expect(input.next()).toBe('b');
  expect(input.next()).toBe('c');
});

test('test eof', () => {
  const input = new InputStream('abc');
  expect(input.eof()).toBe(false);
  input.next();
  expect(input.eof()).toBe(false);
  input.next();
  expect(input.eof()).toBe(false);
  input.next();
  expect(input.eof()).toBe(true);
});
