import { v4 as uuid } from 'uuid';
import BasketDB from '../..';

import Basket from '../basket';
import DB from './main/db';

export default class Bag<t extends BasketDB.Types.Core.DB.HiddenProps> {
  public readonly id: string;

  public basket: Basket<t>;

  public tasks: BasketDB.Types.Basket.Task[];

  public repel: DB<t>;

  constructor(basket: Basket<t>, db: DB<t>, id?: string) {
    this.id = id || uuid();

    this.basket = basket;

    this.tasks = [];

    this.repel = db;
  }

  public async doTasks() {
    // do all tasks
    for await (const task of this.tasks) {
      const index = this.tasks.findIndex((t) => t.id === task.id);

      const res = await task.func(task.args);

      // check if it is missed onComplete
      if (typeof task.onComplete === 'function') {
        await task.onComplete(res);
      } else {
        await this.basket.dump(
          `Bag-${this.id}: Cannot run task onComplete of task: "${task.name}" "${task.id}"`
        );
      }

      this.tasks.splice(index);

      // debug
      // check if task is a Trashman check task so that console will not be flooded
      if (!task.isTrashmanTask) {
        this.basket.logger.debug(
          `Bag-${this.id}: Ran task: "${task.name}" "${task.id}".`
        );
      }

      continue;
    }
  }
}
