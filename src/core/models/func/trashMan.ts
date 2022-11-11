import BasketDB from '../../..';
import Basket from '../../basket';
import DB from '../misc/db';

export default class Trashman<t extends BasketDB.Types.Core.DB.HiddenProps> {
  protected basket: Basket<t>;
  protected mainDB: DB<t>;

  public schedule: BasketDB.Types.Core.Trashman.Schedule;

  protected checkInterval: unknown;

  constructor(basket: Basket<t>, mainDB: DB<t>) {
    this.basket = basket;
    this.mainDB = mainDB;

    this.schedule = {};

    this.checkInterval = setInterval(async () => {
      // queue task to check
      this.basket.queueTask(
        'trashmanCheck',
        async () => {
          return await this.check();
        },
        [],
        async (res) => {
          return res;
        },
        true
      );
    }, 1000);
  }

  public async close() {
    clearInterval(this.checkInterval as number);
  }

  public async mark(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    try {
      const date = new Date();
      date.setSeconds(
        date.getSeconds() +
          (this.basket.config?.trashmanCollectionIntervalInSeconds || 600)
      ); // 10 mins default

      this.schedule[key] = { key, date, onComplete };

      // mark for removal
      await this.basket.read();

      if (Array.isArray(this.mainDB.data)) {
        await this.basket.searchIndex(key, async (res) => {
          if (res) {
            (this.mainDB.data as BasketDB.Types.Core.DB.ReturnType<t>[])[
              res as number
            ].___markedForRemoval = true;

            await this.basket.write();

            // debug
            this.basket.logger.debug(`Trashman: Marked "${key}" for removal.`);
          }
        });
      } else {
        await this.basket.search(key, async (res) => {
          if (res) {
            (this.mainDB.data as Record<string, t>)[key].___markedForRemoval =
              true;

            await this.basket.write();

            // debug
            this.basket.logger.debug(`Trashman: Marked "${key}" for removal.`);
          }
        });
      }
    } catch (error) {
      await this.basket.dump(
        'FAILED TRASHMAN MARK, POSSIBLE CAUSE: INVALID DATA'
      );
      throw error;
    }
  }

  protected async check() {
    const results: BasketDB.Types.Core.DB.ReturnType<t>[] = [];

    try {
      for (const key in this.schedule) {
        if (Object.prototype.hasOwnProperty.call(this.schedule, key)) {
          const schedule = this.schedule[key];

          const difference =
            new Date().getSeconds() - schedule.date.getSeconds();

          if (difference >= 0) {
            // date past
            // queue task to remove
            this.basket.queueTask(
              'trashmanRemove',
              async () => {
                // read
                await this.mainDB.read();

                const keyExistsMemory = await this.mainDB.keyExistsMemory(key);

                if (keyExistsMemory) {
                  if (Array.isArray(this.mainDB.data)) {
                    const index = (await this.mainDB.searchIndex(
                      key
                    )) as number;

                    const old = this.mainDB.data[index];

                    this.mainDB.data.splice(index);

                    // write
                    await this.mainDB.write();

                    // remove from schedule
                    delete this.schedule[key];

                    // debug
                    this.basket.logger.debug(
                      `Trashman: Removed item marked for removal, "${key}", and removed from Trashman schedule`
                    );

                    return {
                      key,
                      value: old.value,
                    };
                  } else {
                    const oldValue = this.mainDB.data[key];

                    delete this.mainDB.data[key];

                    // write
                    await this.mainDB.write();

                    // remove from schedule
                    delete this.schedule[key];

                    // debug
                    this.basket.logger.debug(
                      `Trashman: Removed item marked for removal, "${key}", and removed from Trashman schedule`
                    );

                    return {
                      key,
                      value: oldValue,
                    };
                  }
                } else {
                  return null;
                }
              },
              [],
              schedule.onComplete
            );
          }
        }
      }

      return results;
    } catch (error) {
      await this.basket.dump(
        'FAILED TRASHMAN CHECK, POSSIBLE CAUSE: INVALID DATA'
      );
      throw error;
    }
  }
}
