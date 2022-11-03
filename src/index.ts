import BasketClass from './core/basket';

namespace BasketDB {
  export const Basket = BasketClass;

  export namespace Types {
    export namespace Basket {
      export type TaskFunc = <t extends unknown[]>(
        args: t
      ) => Promise<unknown | null>;
      export type TaskCompleteFunc = <t>(result: t) => unknown;

      export interface Task {
        id: string;
        func: TaskFunc;
        onComplete: TaskCompleteFunc;
        args: unknown[];
      }
    }

    export namespace Core {
      export type DBType = 'array' | 'object';

      export interface DBReturnType<t> {
        key: string;
        value: t;
      }

      export type DBSchema<t> = Record<string, t> | DBReturnType<t>[];
    }
  }
}

export default BasketDB;
