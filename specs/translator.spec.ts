import { addTransformationFunction, mergeSchemaWithSpecific, translate } from '../src/translator';
import {
  test01, test02, test03, test04, test05, test06, test07, test08, test09,
} from './translator.data';

describe('translator merge specific with schema', () => {
  test('When specific add property should merge with schema', () => {
    const result = mergeSchemaWithSpecific(test01.schema, test01.specific);
    expect(result).toEqual(test01.expected);
  });

  test('When specific delete property should delete from schema', () => {
    const result = mergeSchemaWithSpecific(test02.schema, test02.specific);
    expect(result).toEqual(test02.expected);
  });

  test('When specific update property should update from schema', () => {
    const result = mergeSchemaWithSpecific(test03.schema, test03.specific);
    expect(result).toEqual(test03.expected);
  });
});

describe('translator translate from source to schema', () => {
  test('When schema has only value property', () => {
    const result = translate(test04.schemaWithSpecific, {});
    expect(result).toEqual(test04.expected);
  });

  test('When schema has only field property', () => {
    const result = translate(test05.schemaWithSpecific, test05.source);
    expect(result).toEqual(test05.expected);
  });

  test('When source has missing field property', () => {
    const result = translate(test06.schemaWithSpecific, test06.source);
    expect(result).toEqual(test06.expected);
  });
});

describe('translate translate from source to schema with transform function', () => {
  test('Should execute uppercase function when exists in transformation function list', () => {
    const result = translate(test07.schemaWithSpecific, test07.source);
    expect(result).toEqual(test07.expected);
  });

  test('Should execute remap function when exists in transformation function list', () => {
    const result = translate(test08.schemaWithSpecific, test08.source);
    expect(result).toEqual(test08.expected);
  });

  test('Should execute added function when exists in transformation function list', () => {
    addTransformationFunction({
      lowercase: (data: any, parameters: any) => data.toLowerCase(),
    });

    const result = translate(test09.schemaWithSpecific, test09.source);
    expect(result).toEqual(test09.expected);
  });
});
