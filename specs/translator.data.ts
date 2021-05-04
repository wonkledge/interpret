import { SpecificSchema, Schema, Source } from '../src';

/*
  TEST 01 DATA
 */
const schema01: Schema = {
  headers: {
    'client-id': {
      value: '409',
    },
  },
  summary: {
    value: '49',
  },
  body: {
    user: {
      id: {
        field: {
          name: 'id',
          transform: 'uppercase',
        },
      },
      name: {
        field: {
          name: 'firstname',
          transform: 'uppercase',
        },
      },
    },
  },
};

const specificTest01: SpecificSchema = {
  create: {
    body: {
      user: {
        lastname: {
          field: {
            name: 'lastname',
            transform: 'uppercase',
          },
        },
      },
    },
  },
  update: {},
  delete: [],
};

export const test01 = {
  schema: schema01,
  specific: specificTest01,
  expected: [{ path: 'headers.client-id', value: '409' }, { path: 'summary', value: '49' }, { field: { name: 'id', transform: 'uppercase' }, path: 'body.user.id' }, { field: { name: 'firstname', transform: 'uppercase' }, path: 'body.user.name' }, { field: { name: 'lastname', transform: 'uppercase' }, path: 'body.user.lastname' }],
};

/*
  TEST 02 DATA
 */
const specificTest02: SpecificSchema = {
  create: {},
  update: {},
  delete: ['body.user.id'],
};

export const test02 = {
  schema: schema01,
  specific: specificTest02,
  expected: [{ path: 'headers.client-id', value: '409' }, { path: 'summary', value: '49' }, { field: { name: 'firstname', transform: 'uppercase' }, path: 'body.user.name' }],
};

/*
  TEST 03 DATA
 */
const specificTest03: SpecificSchema = {
  create: {},
  update: {
    body: {
      user: {
        name: {
          field: {
            name: 'lastname',
            transform: 'uppercase',
          },
        },
      },
    },
  },
  delete: [],
};

export const test03 = {
  schema: schema01,
  specific: specificTest03,
  expected: [{ path: 'headers.client-id', value: '409' }, { path: 'summary', value: '49' }, { field: { name: 'id', transform: 'uppercase' }, path: 'body.user.id' }, { field: { name: 'lastname', transform: 'uppercase' }, path: 'body.user.name' }],
};

/*
  TEST 04 DATA
 */
const schema02: Schema = {
  headers: {
    'client-id': {
      value: '409',
    },
  },
  summary: {
    value: '49',
  },
};

export const test04 = {
  schemaWithSpecific: { schema: schema02 },
  expected: {
    errors: [],
    result: {
      headers: {
        'client-id': '409',
      },
      summary: '49',
    },
  },
};

/*
  TEST 05 DATA
 */
const schema03: Schema = {
  headers: {
    'client-id': {
      field: {
        name: 'client-ext-id',
      },
    },
  },
  body: {
    user: {
      name: {
        field: {
          name: 'username',
        },
      },
      password: {
        field: {
          name: 'secret',
        },
      },
    },
  },
};

const source01: Source = {
  headers: {
    general: {
      ip: '10.0.0.0',
      location: 'France',
      'client-ext-id': 'wonkledge',
    },
  },
  body: {
    user_detail: {
      username: 'Andreei',
      secret: '1234567',
      transactions: [
        {
          amount_value: 400,
          currency_value: 'EUR',
          reason: 'Rent',
        },
        {
          amount_value: 200,
          currency_value: 'EUR',
          reason: 'Food',
        },
      ],
    },
  },
};

export const test05 = {
  schemaWithSpecific: { schema: schema03 },
  source: source01,
  expected: {
    errors: [],
    result: {
      body: {
        user: {
          name: 'Andreei',
          password: '1234567',
        },
      },
      headers: {
        'client-id': 'wonkledge',
      },
    },
  },
};

/*
  TEST 06 DATA
 */
const source02: Source = {
  headers: {
    general: {
      ip: '10.0.0.0',
      location: 'France',
      'client-ext-id': 'wonkledge',
    },
  },
  body: {
    user_detail: {
      username: 'Andreei',
    },
  },
};

export const test06 = {
  schemaWithSpecific: { schema: schema03 },
  source: source02,
  expected: {
    errors: [
      {
        field: {
          name: 'secret',
        },
        path: 'body.user.password',
      },
    ],
    result: {
      body: {
        user: {
          name: 'Andreei',
        },
      },
      headers: {
        'client-id': 'wonkledge',
      },
    },
  },
};

/*
  TEST 07 DATA
 */

const schema04: Schema = {
  headers: {
    'client-id': {
      field: {
        name: 'client-ext-id',
      },
    },
  },
  body: {
    user: {
      name: {
        field: {
          name: 'username',
          transform: 'uppercase',
        },
      },
      password: {
        field: {
          name: 'secret',
        },
      },
    },
  },
};

export const test07 = {
  schemaWithSpecific: { schema: schema04 },
  source: source01,
  expected: {
    errors: [],
    result: {
      body: {
        user: {
          name: 'ANDREEI',
          password: '1234567',
        },
      },
      headers: {
        'client-id': 'wonkledge',
      },
    },
  },
};

/*
  TEST 08 DATA
 */

const schema05: Schema = {
  headers: {
    'client-id': {
      field: {
        name: 'client-ext-id',
      },
    },
  },
  body: {
    user: {
      name: {
        field: {
          name: 'username',
          transform: 'uppercase',
        },
      },
      password: {
        field: {
          name: 'secret',
        },
      },
      summary: {
        field: {
          name: 'transactions',
          transform: 'remap',
          parameters: {
            amount: {
              field: {
                name: 'amount_value',
              },
            },
            currency: {
              field: {
                name: 'currency_value',
              },
            },
            description: {
              field: {
                name: 'reason',
              },
            },
          },
        },
      },
    },
  },
};

export const test08 = {
  schemaWithSpecific: { schema: schema05 },
  source: source01,
  expected: {
    errors: [],
    result: {
      body: {
        user: {
          name: 'ANDREEI',
          password: '1234567',
          summary: [
            {
              amount: 400,
              currency: 'EUR',
              description: 'Rent',
            },
            {
              amount: 200,
              currency: 'EUR',
              description: 'Food',
            },
          ],
        },
      },
      headers: {
        'client-id': 'wonkledge',
      },
    },
  },
};

/*
  TEST 09 DATA
 */
const schema06: Schema = {
  headers: {
    'client-id': {
      field: {
        name: 'client-ext-id',
      },
    },
  },
  body: {
    user: {
      name: {
        field: {
          name: 'username',
          transform: 'lowercase',
        },
      },
      password: {
        field: {
          name: 'secret',
        },
      },
    },
  },
};

const source06: Source = {
  headers: {
    general: {
      ip: '10.0.0.0',
      location: 'France',
      'client-ext-id': 'wonkledge',
    },
  },
  body: {
    user_detail: {
      username: 'ANDREEI',
      secret: '1234567',
      transactions: [
        {
          amount_value: 400,
          currency_value: 'EUR',
          reason: 'Rent',
        },
        {
          amount_value: 200,
          currency_value: 'EUR',
          reason: 'Food',
        },
      ],
    },
  },
};

export const test09 = {
  schemaWithSpecific: { schema: schema06 },
  source: source06,
  expected: {
    errors: [],
    result: {
      body: {
        user: {
          name: 'andreei',
          password: '1234567',
        },
      },
      headers: {
        'client-id': 'wonkledge',
      },
    },
  },
};
