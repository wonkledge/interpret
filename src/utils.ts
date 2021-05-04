export type TransformFunction = 'uppercase' | 'remap';

export type Property = ValueProperty | FieldProperty;
export interface ValueProperty {
  value: any
}

export interface SchemaWithSpecific {
  schema: Schema,
  specific?: SpecificSchema
}

export interface TransformationFunction {
  [key: string]: (data: any, parameters: any) => any
}

export interface SpecificSchema {
  create: Schema,
  update: Schema,
  delete: string[]
}

export interface Schema {
  [key: string]: Schema | Property
}

export interface Source {
  [key: string]: unknown
}

export interface FieldProperty {
  field: {
    name: string,
    transform?: string,
    parameters?: any
  }
}

export interface SchemaProp {
  path: string,
  field?: {
    name: string,
    transform?: string
  },
  value?: any,
}

export type SourceProp = {
  path: string,
  value: any
};

export const prefix = (root: string, val: string | number): string => (root ? `${root}.${val}` : val.toString());

export const isObject = (data: unknown): data is Object => typeof data === 'object' && data !== null && !Array.isArray(data);

// eslint-disable-next-line no-prototype-builtins
export const isProperty = (data: unknown): data is Property => isObject(data) && (data.hasOwnProperty('field') || data.hasOwnProperty('value'));

// eslint-disable-next-line no-prototype-builtins
export const isValueProperty = (data: unknown): data is ValueProperty => isObject(data) && data.hasOwnProperty('value');

// eslint-disable-next-line no-prototype-builtins
export const isSchemaWithSpecific = (data: unknown): data is SchemaWithSpecific => isObject(data) && data.hasOwnProperty('schema');
// eslint-disable-next-line no-prototype-builtins
export const isKeyExists = (obj: Record<string, any>, key: string) => obj.hasOwnProperty(key);

export const SchemaProperty = (path:string, property: Property): SchemaProp => ({
  path,
  ...property,
});

export const SourceProperty = (path: string, value: unknown): SourceProp => ({
  path,
  value,
});

export const TranslatorError = (property: SchemaProp) => ({
  ...property,
});

export const flattenArray = <T>(acc: T[], val: unknown): T[] => {
  if (Array.isArray(val)) {
    return [...acc, ...val.reduce(flattenArray, [])];
  }
  // @ts-ignore
  return [...acc, val];
};

export const find = (sourceProps: SourceProp[], fieldname: string): any | undefined => {
  const result = sourceProps.filter((sourceProp) => {
    const regExp = new RegExp(fieldname);
    return sourceProp.path.match(regExp);
  });

  return result.length > 1 || result.length === 0 ? undefined : result[0].value;
};

export const findFromArray = (arraySourceProps: SourceProp[], fieldname: string, index: number): any | undefined => {
  const result = arraySourceProps.filter((sourceProp) => {
    const fieldRegExp = new RegExp(fieldname);
    const indexRegExp = new RegExp(`${index.toString()}`);
    return sourceProp.path.match(fieldRegExp) && sourceProp.path.match(indexRegExp);
  });
  return result.length > 1 || result.length === 0 ? undefined : result[0].value;
};

export const access = (obj: Record<string, any>, path: string) => {
  const step = path.split('.');
  return step.reduce((acc:any, val:any) => acc[val], obj);
};

export const createProperty = (path: string, value: any, obj = {}) => {
  const steps = path.split('.');
  let currentStep = '';
  return steps.reduce((objCreated: any, step: string, index) => {
    if (index === 0) {
      if (index === steps.length - 1) {
        // eslint-disable-next-line no-param-reassign
        objCreated[step] = value;
        return objCreated;
      }

      if (!isKeyExists(objCreated, step)) {
        // eslint-disable-next-line no-param-reassign
        objCreated[step] = {};
      }

      currentStep += step;
      return objCreated;
    }

    if (index === steps.length - 1) {
      access(objCreated, currentStep)[step] = value;
      return objCreated;
    }

    if (!isKeyExists(access(objCreated, currentStep), step)) {
      access(objCreated, currentStep)[step] = {};
    }

    currentStep += `.${step}`;
    return objCreated;
  }, obj);
};

export const computeFieldValue = (sourceProps: SourceProp[], schemaProp: FieldProperty, index: number) => {
  const value = find(sourceProps, schemaProp.field.name) || findFromArray(sourceProps, schemaProp.field.name, index);

  if (value === undefined) {
    return undefined;
  }

  return value;
};

