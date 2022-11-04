import BasketClass from './core/basket';

namespace BasketDB {
  export const Basket = BasketClass;

  export namespace Types {
    export namespace Basket {
      export interface Config {
        trashmanCollectionIntervalInSeconds?: number;
      }

      export type TaskFunc = <t extends unknown[]>(
        args: t
      ) => Promise<unknown | null>;
      export type TaskCompleteFunc = (result: unknown) => Promise<unknown>;

      export interface Task {
        id: string;
        func: TaskFunc;
        onComplete: TaskCompleteFunc;
        args: unknown[];
      }
    }

    export namespace Core {
      export namespace DB {
        export type Type = 'array' | 'object';

        export interface ReturnType<t> extends HiddenProps {
          key: string;
          value: t;
        }

        export interface HiddenProps {
          ___markedForRemoval?: boolean;
        }

        export type Schema<t> = Record<string, t> | ReturnType<t>[];

        export interface Combo<t> {
          key: string;
          value: t;
        }
      }

      export namespace Trashman {
        export type Schedule = Record<
          string,
          {
            key: string;
            date: Date;
            onComplete: BasketDB.Types.Basket.TaskCompleteFunc;
          }
        >;
      }
    }
  }
}

export default BasketDB;
