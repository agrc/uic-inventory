import { describe, expect, test } from 'vitest';
import * as yup from 'yup';
import { WellDetailsCommonSchema } from './validationSchemas';

describe('schema tests', () => {
  describe('without context', () => {
    const schema = yup.object().shape(WellDetailsCommonSchema('a', 'b'), [['a', 'b']]);
    test('throws when empty', () => {
      expect(() => schema.validateSync({})).toThrow();
    });

    test('a with a value is valid', () => {
      expect(
        schema.validateSync({
          a: 'a',
        }),
      ).toStrictEqual({
        a: 'a',
      });
    });

    test('b with a value is valid', () => {
      expect(
        schema.validateSync({
          b: { name: 'b' },
        }),
      ).toStrictEqual({
        b: { name: 'b' },
      });
    });

    test('a and b are mutually exclusive', () => {
      expect(() =>
        console.log(
          schema.validateSync({
            a: 'a',
            b: { name: 'b' },
          }),
        ),
      ).toThrowError(/type your response or upload a file/);
    });
  });

  describe('with context', () => {
    const schema = yup.object().shape(
      {
        ...WellDetailsCommonSchema('a', 'b'),
        ...WellDetailsCommonSchema('c', 'd'),
      },
      [
        ['a', 'b'],
        ['c', 'd'],
      ],
    );

    test('throws when empty', () => {
      expect(() => schema.validateSync({}, { context: { subClass: 5002 } })).toThrow();
    });

    test('a and c with values are valid', () => {
      expect(
        schema.validateSync(
          {
            a: 'a',
            c: 'c',
          },
          { context: { subClass: 5002 } },
        ),
      ).toStrictEqual({
        a: 'a',
        c: 'c',
      });
    });

    test('a and d with values are valid', () => {
      expect(
        schema.validateSync(
          {
            a: 'a',
            d: { name: 'd' },
          },
          { context: { subClass: 5002 } },
        ),
      ).toStrictEqual({
        a: 'a',
        d: { name: 'd' },
      });
    });

    test('b and d with values are valid', () => {
      expect(
        schema.validateSync(
          {
            b: { name: 'b' },
            d: { name: 'd' },
          },
          { context: { subClass: 5002 } },
        ),
      ).toStrictEqual({
        b: { name: 'b' },
        d: { name: 'd' },
      });
    });

    test('b and c with values are valid', () => {
      expect(
        schema.validateSync(
          {
            b: { name: 'File' },
            c: 'c',
          },
          { context: { subClass: 5002 } },
        ),
      ).toStrictEqual({
        b: { name: 'File' },
        c: 'c',
      });
    });

    test('[a, b], [c, d] are mutually exclusive', () => {
      expect(() =>
        schema.validateSync(
          {
            a: 'a',
            b: { name: 'File' },
            c: 'c',
            d: { name: 'File' },
          },
          { context: { subClass: 5002 } },
        ),
      ).toThrow();
    });

    test('c or d is required for 5002 subClass', () => {
      expect(() =>
        schema.validateSync(
          {
            a: 'a',
          },
          { context: { subClass: 5002 } },
        ),
      ).toThrowError(/((d.name)|c) is a required field/);
    });
  });
});
