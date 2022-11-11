import { v4 as uuid } from 'uuid';
import BasketDB from '../..';

import Basket from '../basket';
import DB from './misc/db';

export default class Bag<t extends BasketDB.Types.Core.DB.HiddenProps> {
  public readonly id: string;

  public basket: Basket<t>;

  public tasks: BasketDB.Types.Basket.Task[];

  public repel: DB<t>;

  constructor(basket: Basket<t>, db: DB<t>) {
    this.id = uuid();

    this.basket = basket;

    this.tasks = [];

    this.repel = db;
  }

  public async doTasks() {
    // do all tasks
    for await (const task of this.tasks) {
      const index = this.tasks.findIndex((t) => t.id === task.id);

      const res = await task.func(task.args);
      await task.onComplete(res);

      this.tasks.splice(index);

      // debug
      // check if task is a Trashman check task so that console will not be flooded
      if (!task.isTrashmanTask) {
        this.basket.logger.debug(`Bag-${this.id}: Ran task "${task.id}".`);
      }

      continue;
    }
  }
}
