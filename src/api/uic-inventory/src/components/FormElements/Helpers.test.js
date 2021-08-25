import { camelToProper } from './Helpers';

test('one word', () => {
  expect(camelToProper('one')).toBe('One');
});

test('two words', () => {
  expect(camelToProper('twoWords')).toBe('Two words');
});

test('three words', () => {
  expect(camelToProper('threeWordsLong')).toBe('Three words long');
});

test('a sentence', () => {
  expect(camelToProper('iWentToTheStoreToday')).toBe('I went to the store today');
});
