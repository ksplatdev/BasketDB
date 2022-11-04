import { v4 as uuid } from 'uuid';
import BasketDB from '../..';

import Basket from '../basket';

export default class Bag<t extends BasketDB.Types.Core.DB.HiddenProps> {
  public readonly id: string;

  public basket: Basket<t>;

  public tasks: BasketDB.Types.Basket.Task[];

  constructor(basket: Basket<t>) {
    this.id = uuid();

    this.basket = basket;

    this.tasks = [];
  }

  public async doTasks() {
    // do all tasks
    for await (const task of this.tasks) {
      const index = this.tasks.findIndex((t) => t.id === task.id);

      const res = await task.func(task.args);
      await task.onComplete(res);

      this.tasks.splice(index);

      continue;
    }
  }
}
