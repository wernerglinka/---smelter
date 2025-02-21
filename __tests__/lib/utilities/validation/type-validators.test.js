import {
  isSimpleList,
  isDateObject,
  isValidDate,
  isComplexObject,
  getFieldType
} from '@lib/utilities/validation/type-validators';

describe('type-validators', () => {
  describe('isSimpleList', () => {
    test('returns true for array of strings', () => {
      expect(isSimpleList(['a', 'b', 'c'])).toBe(true);
    });

    test('returns true for array of numbers', () => {
      expect(isSimpleList([1, 2, 3])).toBe(true);
    });

    test('returns false for mixed type arrays', () => {
      expect(isSimpleList(['string', 123, true])).toBe(false);
    });

    test('returns false for array of objects', () => {
      expect(isSimpleList([{ a: 1 }, { b: 2 }])).toBe(false);
    });

    test('returns false for array of arrays', () => {
      expect(isSimpleList([[1], [2]])).toBe(false);
    });

    test('returns false for empty array', () => {
      expect(isSimpleList([])).toBe(false);
    });

    test('returns false for non-array', () => {
      expect(isSimpleList('not an array')).toBe(false);
      expect(isSimpleList(123)).toBe(false);
      expect(isSimpleList(null)).toBe(false);
      expect(isSimpleList(undefined)).toBe(false);
      expect(isSimpleList({})).toBe(false);
    });
  });

  describe('isDateObject', () => {
    test('returns true for valid date object', () => {
      expect(isDateObject(new Date())).toBe(true);
    });

    test('returns true for valid date string', () => {
      expect(isDateObject('2023-12-25')).toBe(true);
      expect(isDateObject('2023-12-25T12:00:00')).toBe(true);
    });

    test('returns false for invalid date string', () => {
      expect(isDateObject('not a date')).toBe(false);
      expect(isDateObject('2023-13-45')).toBe(false);
    });

    test('returns false for non-date values', () => {
      expect(isDateObject(123)).toBe(false);
      expect(isDateObject(null)).toBe(false);
      expect(isDateObject(undefined)).toBe(false);
      expect(isDateObject({})).toBe(false);
      expect(isDateObject([])).toBe(false);
    });
  });

  describe('isValidDate', () => {
    test('returns true for valid date object', () => {
      expect(isValidDate(new Date())).toBe(true);
    });

    test('returns false for invalid date', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
    });

    test('returns false for non-date objects', () => {
      expect(isValidDate({})).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
    });
  });

  describe('isComplexObject', () => {
    test('returns true for objects with nested structure', () => {
      expect(isComplexObject({ a: { b: 1 } })).toBe(true);
      expect(isComplexObject({ a: [1, 2, 3] })).toBe(true);
    });

    test('returns false for simple objects', () => {
      expect(isComplexObject({ a: 1, b: 2 })).toBe(false);
      expect(isComplexObject({ a: 'string', b: 123 })).toBe(false);
    });

    test('returns false for non-objects', () => {
      expect(isComplexObject(null)).toBe(false);
      expect(isComplexObject(undefined)).toBe(false);
      expect(isComplexObject(123)).toBe(false);
      expect(isComplexObject('string')).toBe(false);
      expect(isComplexObject([1, 2, 3])).toBe(false);
    });

    test('returns false for empty object', () => {
      expect(isComplexObject({})).toBe(false);
    });

    test('returns true for objects with date values', () => {
      expect(isComplexObject({ date: new Date() })).toBe(true);
    });
  });

  describe('getFieldType', () => {
    it('returns correct field type for different values', () => {
      // Test simple list
      expect(getFieldType(['a', 'b', 'c'])).toBe('list');

      // Test date
      expect(getFieldType(new Date())).toBe('date');
      expect(getFieldType('2023-01-01')).toBe('date');

      // Test array that is not a simple list
      expect(getFieldType([{}, true, 42])).toBe('array'); // Mixed type array
      expect(
        getFieldType([
          [1, 2],
          [3, 4]
        ])
      ).toBe('array'); // Array of arrays

      // Test other types
      expect(getFieldType(true)).toBe('boolean');
      expect(getFieldType(42)).toBe('number');
      expect(getFieldType('text')).toBe('string');
      expect(getFieldType(null)).toBe('null');
      expect(getFieldType({ nested: { value: 1 } })).toBe('object');
      expect(getFieldType(undefined)).toBe('undefined');
      expect(getFieldType()).toBe('undefined');
      expect(getFieldType(Symbol())).toBe('symbol');
      expect(getFieldType(function () {})).toBe('function');
    });
  });
});
