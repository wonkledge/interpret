import {
  computeFieldValue, createProperty,
  FieldProperty,
  flattenArray,
  isObject,
  isProperty, isValueProperty,
  prefix,
  Property,
  Schema,
  SchemaProp,
  SchemaProperty, SchemaWithSpecific, Source, SourceProp, SourceProperty, SpecificSchema, TransformationFunction, TranslatorError,
} from './utils';

let transformFunctions = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uppercase: (data: any, parameters: any) => data.toUpperCase(),

  remap: (data: any, parameters: any) => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const dataTranslated = data.map((d:any, index: number) => translate({ schema: parameters }, d, index));
    const errors = dataTranslated.filter((val: { result:[], errors:[] }) => val.errors.length > 0);

    if (errors.length > 0) {
      return undefined;
    }

    return dataTranslated.map((result: { errors: [], result: any }) => result.result);
  },
};

export const addTransformationFunction = (functions: TransformationFunction) => {
  transformFunctions = { ...transformFunctions, ...functions };
};

const fromSchemaToSchemaProps = (data: Schema, root = ''): SchemaProp[] => Object.keys(data).map((key: keyof typeof data) => {
  if (isObject(data) && !isProperty(data[key])) {
    const deeperSchema = data[key] as Schema;
    return fromSchemaToSchemaProps(deeperSchema, prefix(root, key));
  }
  const property = data[key] as Property;
  const path = prefix(root, key);
  return SchemaProperty(path, property);
}).reduce(flattenArray, []);

const fromSourceToSourceProps = (data: Source, root = ''): SourceProp[] => Object.keys(data).map((key: keyof typeof data) => {
  if (isObject(data[key])) {
    const deeperSource = data[key] as Source;
    return fromSourceToSourceProps(deeperSource, prefix(root, key));
  }
  const path = prefix(root, key);
  return SourceProperty(path, data[key]);
}).reduce(flattenArray, []);

const applyTransformation = (data: any, functionName: string, parameters?: any) => {
  if (data === undefined || data === null) {
    return data;
  }

  // @ts-ignore
  const fct = transformFunctions[functionName];

  if (fct !== undefined) {
    return fct(data, parameters);
  }

  return undefined;
};

export const mergeSchemaWithSpecific = (schema: Schema, specificSchema: SpecificSchema): SchemaProp[] => {
  const schemaProps = fromSchemaToSchemaProps(schema);
  const updatePropsPath = fromSchemaToSchemaProps(specificSchema.update).map((property) => property.path);
  const schemaPropsCleaned = schemaProps.filter((property) => !specificSchema.delete.includes(property.path)
    && !updatePropsPath.includes(property.path));

  return [
    ...schemaPropsCleaned,
    ...fromSchemaToSchemaProps(specificSchema.create),
    ...fromSchemaToSchemaProps(specificSchema.update),
  ];
};

export const translate = (schemaWithSpecific: SchemaWithSpecific, source: Source, index = 0) => {
  const schemaProperties = schemaWithSpecific.specific ? mergeSchemaWithSpecific(schemaWithSpecific.schema, schemaWithSpecific.specific)
    : fromSchemaToSchemaProps(schemaWithSpecific.schema);
  const sourceProperties = fromSourceToSourceProps(source);

  return schemaProperties.reduce((acc: any, property: SchemaProp) => {
    if (isValueProperty(property)) {
      acc.result = createProperty(property.path, property.value, acc.result);
      return acc;
    }

    const x = property as FieldProperty;
    let value = computeFieldValue(sourceProperties, x, index);

    if (x.field.transform) {
      value = applyTransformation(value, x.field.transform, x.field.parameters);
    }

    if (value) {
      acc.result = createProperty(property.path, value, acc.result);
    } else {
      acc.errors = [...acc.errors, TranslatorError(property)];
    }

    return acc;
  }, { result: {}, errors: [] });
};
