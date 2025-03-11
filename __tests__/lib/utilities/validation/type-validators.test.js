import {
  isSimpleList,
  isDateObject,
  isValidDate,
  isComplexObject,
  getFieldType,
  isString,
  isNumber,
  isBoolean,
  isDate,
  isArray,
  isObject,
  isNull,
  isUndefined,
  isEmpty
} from '@utils/validation/types';

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

  describe('isString', () => {
    test('returns true for strings', () => {
      expect(isString('')).toBe(true);
      expect(isString('hello')).toBe(true);
      expect(isString(String('world'))).toBe(true);
    });

    test('returns false for non-strings', () => {
      expect(isString(123)).toBe(false);
      expect(isString(true)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
    });
  });

  describe('isNumber', () => {
    test('returns true for numbers', () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(123)).toBe(true);
      expect(isNumber(-456)).toBe(true);
      expect(isNumber(123.456)).toBe(true);
      expect(isNumber(Number('789'))).toBe(true);
    });

    test('returns false for non-numbers', () => {
      expect(isNumber('123')).toBe(false);
      expect(isNumber(true)).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber([])).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber(NaN)).toBe(false);
    });
  });

  describe('isBoolean', () => {
    test('returns true for booleans', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(Boolean(1))).toBe(true);
    });

    test('returns false for non-booleans', () => {
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean({})).toBe(false);
      expect(isBoolean([])).toBe(false);
      expect(isBoolean(null)).toBe(false);
      expect(isBoolean(undefined)).toBe(false);
    });
  });

  describe('isDate function', () => {
    test('returns true for dates', () => {
      expect(isDate(new Date())).toBe(true);
    });

    test('returns false for non-dates', () => {
      expect(isDate('2023-01-01')).toBe(false);
      expect(isDate(123456789)).toBe(false);
      expect(isDate({})).toBe(false);
      expect(isDate([])).toBe(false);
      expect(isDate(null)).toBe(false);
      expect(isDate(undefined)).toBe(false);
    });
  });

  describe('isArray', () => {
    test('returns true for arrays', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray(new Array())).toBe(true);
    });

    test('returns false for non-arrays', () => {
      expect(isArray({})).toBe(false);
      expect(isArray('[]')).toBe(false);
      expect(isArray(123)).toBe(false);
      expect(isArray(true)).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
    });
  });

  describe('isObject', () => {
    test('returns true for objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
      expect(isObject(new Object())).toBe(true);
    });

    test('returns false for non-objects', () => {
      expect(isObject([])).toBe(false);
      expect(isObject('object')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(true)).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });
  });

  describe('isNull', () => {
    test('returns true for null', () => {
      expect(isNull(null)).toBe(true);
    });

    test('returns false for non-null', () => {
      expect(isNull(undefined)).toBe(false);
      expect(isNull(0)).toBe(false);
      expect(isNull('')).toBe(false);
      expect(isNull(false)).toBe(false);
      expect(isNull({})).toBe(false);
      expect(isNull([])).toBe(false);
    });
  });

  describe('isUndefined', () => {
    test('returns true for undefined', () => {
      expect(isUndefined(undefined)).toBe(true);
      let undef;
      expect(isUndefined(undef)).toBe(true);
    });

    test('returns false for non-undefined', () => {
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined(0)).toBe(false);
      expect(isUndefined('')).toBe(false);
      expect(isUndefined(false)).toBe(false);
      expect(isUndefined({})).toBe(false);
      expect(isUndefined([])).toBe(false);
    });
  });

  describe('isEmpty', () => {
    test('returns true for empty values', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    test('returns false for non-empty values', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });

    test('handles special cases', () => {
      // Empty string with spaces should be considered empty
      expect(isEmpty('   ')).toBe(true);

      // Empty object with own properties should not be considered empty
      const objWithProp = Object.create(null);
      objWithProp.test = 'value';
      expect(isEmpty(objWithProp)).toBe(false);
    });
  });
});
