# BasketDB

Fast, Scalable, Extremely-Small, Open-Source, NodeJS Database for all use-cases.

## Features

- Basket -> Bag -> Task System
  - Baskets (Databases) can be "splintered" into multiple Bags (nodes) to handle tasks
    - This allows for easy scaling
  - Tasks are smartly assigned to Bags (Nodes) to handle a task (ie: search, add, remove, modify, etc...)
- Performant & Efficient
  - The Basket -> Bag -> Task System allows for tasks to be run efficiently and fast
  - The Trashman marks a later removal time to free up tasks with removal calls
    - Also marks an item in the Basket to be deleted so that it cannot be used while waiting to be removed
  - Fast Serialization & Deserialization
    - Uses Chrome V8 for Serialization & Deserialization of data
  - Auto Read & Write
    - Read and Write calls are automatically ran *only* when needed for a task
- Safe
  - BasketDB includes an easy way to Backup and Restore a database
  - Saves a copy of the database that is one task behind (Basket.InternalBag.oldRepel)
    - This old copy is dumped when a Dump occurs
  - Dumps Logger Trace and Copy of Database before error occurred for easy restore and debugging
- Easy to Debug Errors
  - Includes a strong Logger for saving and showing debug, warn, and error messages
  - Logger also includes a trace to see everything that happened before a Dump or anything
- Flexible & Schemas
  - With the use of typescript, a database will always have a structure
- Small
  - BasketDB comes in at a very small package size
- Written in TypeScript
  - Builtin typedefs
  - Less common for bugs

## Download

### NPM / YARN

1. CD into your project that you would like to install BasketDB into.
2. Run `npm install basketdb` or if using yarn, run `yarn add basketdb`.
3. Import BasketDB using ES6 Import: `import BasketDB from 'basketdb'` or use require: `const { default: BasketDB } = require('basketdb')`
4. Read [Getting Started](./pages/wiki/getting-started.md) or the [Docs](./pages/docs/home.md)

### Github

1. Download the [latest release](https://github.com/ksplatdev/BasketDB/releases/latest)
2. Unzip the package into a directory in your project
3. Import BasketDB using ES6 Import: `import BasketDB from 'path/to/BasketDB'` or use require: `const { default: BasketDB } = require('path/to/BasketDB')` 
4. Read [Getting Started](./pages/wiki/getting-started.md) or the [Docs](./pages/docs/home.md)

### CDN

1. Copy the CDN Link [https://cdn.jsdelivr.net/npm/duckengine@2.1.0/dist/index.js](https://cdn.jsdelivr.net/npm/basketdb@1.0.0/dist/index.js)
2. Import BasketDB using ES6 Import: `import BasketDB from 'cdn/link/here'` or use require: `const { default: BasketDB } = require('cdn/link/here')`
3. Read [Getting Started](./pages/wiki/getting-started.md) or the [Docs](./pages/docs/home.md)

## License

[MIT LICENSE](LICENSE)

## Author

Bleart Emini (ksplatdev)
