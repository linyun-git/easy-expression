import InputStream from '../src/InputStream';

test('test peek', () => {
  const input = new InputStream('abc');
  expect(input.peek()).toBe('a');
  expect(input.peek()).toBe('a');
  input.next();
  expect(input.peek()).toBe('b');
  input.next();
  expect(input.peek()).toBe('c');
  input.next();
  expect(input.peek()).toBe(undefined);
});

test('test next', () => {
  const input = new InputStream('abc');
  expect(input.next()).toBe('a');
  expect(input.next()).toBe('b');
  expect(input.next()).toBe('c');
  expect(input.next()).toBe(undefined);
});

test('test back', () => {
  const input = new InputStream('abc');
  expect(input.next()).toBe('a');
  input.back();
  expect(input.next()).toBe('a');
  expect(input.next()).toBe('b');
  expect(input.next()).toBe('c');
  input.back();
  expect(input.next()).toBe('c');
  expect(input.next()).toBe(undefined);
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

test('test pos', () => {
  const input = new InputStream('abc\nabc\n');
  expect(input.pos()).toBe('1:1');
  input.next();
  expect(input.pos()).toBe('1:2');
  input.next();
  expect(input.pos()).toBe('1:3');
  input.back();
  expect(input.pos()).toBe('1:2');
  input.next();
  expect(input.pos()).toBe('1:3');
  input.next();
  expect(input.pos()).toBe('1:4');
  input.next();
  expect(input.pos()).toBe('2:1');
  input.back();
  expect(input.pos()).toBe('1:4');
  input.next();
  expect(input.pos()).toBe('2:1');
  input.next();
  expect(input.pos()).toBe('2:2');
  input.next();
  expect(input.pos()).toBe('2:3');
  input.next();
  expect(input.pos()).toBe('2:4');
  input.back();
  expect(input.pos()).toBe('2:3');
  expect(() => input.back()).toThrow('at the beginning of the string');
});
