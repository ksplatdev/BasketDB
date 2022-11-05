import { v4 as uuid } from 'uuid';

import Bag from './models/bag';
import DB from './models/misc/db';
import BasketDB from '..';
import Trashman from './models/func/trashMan';

export default class Basket<t extends BasketDB.Types.Core.DB.HiddenProps> {
  public readonly id: string;
  public readonly config: BasketDB.Types.Basket.Config;

  protected mainDB: DB<t>;
  public trashman: Trashman<t>;

  public bags: Bag<t>[];
  public taskTree: Record<string, BasketDB.Types.Basket.Task>;

  constructor(
    mainDB: string,
    type: BasketDB.Types.Core.DB.Type,
    config?: BasketDB.Types.Basket.Config
  ) {
    this.id = uuid();
    this.config = config || {};

    this.mainDB = new DB(mainDB, type, this);
    this.trashman = new Trashman(this, this.mainDB);

    this.bags = [];
    this.taskTree = {};
  }

  public async splinter(amount?: number) {
    if (amount) {
      for (let i = 0; i < amount; i++) {
        const bag = new Bag(this);
        this.bags.push(bag);

        // splinter tasks in case some waiting
        await this.splinterTasks();
      }
    } else {
      const bag = new Bag(this);
      this.bags.push(bag);

      // splinter tasks in case some waiting
      await this.splinterTasks();
    }
    return;
  }

  protected async splinterTasks() {
    const bagLengths = this.bags.map((b) => {
      return { id: b.id, length: b.tasks.length };
    });

    for (const key in this.taskTree) {
      const smallestBagID = bagLengths.sort((a, b) => {
        return a.length - b.length;
      })[0].id;

      const smallestBag = this.bags.find(
        (b) => b.id === smallestBagID
      ) as Bag<t>;

      if (Object.prototype.hasOwnProperty.call(this.taskTree, key)) {
        const task = this.taskTree[key];

        smallestBag.tasks.push(task);

        delete this.taskTree[key];

        await smallestBag.doTasks();

        continue;
      }
    }
  }

  public async queueTask(
    func: BasketDB.Types.Basket.TaskFunc,
    args: unknown[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    const id = uuid();

    this.taskTree[id] = {
      id,
      func,
      args,
      onComplete,
    };

    // splinter new task(s)
    await this.splinterTasks();
  }

  public get data() {
    return this.mainDB.data;
  }

  public async read() {
    return await this.mainDB.read();
  }

  public async write() {
    return await this.mainDB.write();
  }

  public async keyExistsMemory(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.keyExistsMemory(key);
      },
      [],
      onComplete
    );
  }

  public async fillEmpty() {
    try {
      await this.read();
    } catch (error) {
      await this.write();
    }
  }

  public async add(
    key: string,
    value: t,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.add(key, value);
      },
      [],
      onComplete
    );
  }

  public async addMany(
    items: BasketDB.Types.Core.DB.Combo<t>[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.addMany(items);
      },
      [],
      onComplete
    );
  }

  public async search(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.search(key);
      },
      [],
      onComplete
    );
  }

  public async searchMany(
    keys: string[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.searchMany(keys);
      },
      [],
      onComplete
    );
  }

  public async searchAndModify(
    key: string,
    value: t,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.searchAndModify(key, value);
      },
      [],
      onComplete
    );
  }

  public async searchAndModifyMany(
    items: BasketDB.Types.Core.DB.Combo<t>[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.searchAndModifyMany(items);
      },
      [],
      onComplete
    );
  }

  public async searchAndRemove(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.searchAndRemove(key, onComplete);
      },
      [],
      onComplete
    );
  }

  public async searchAndRemoveMany(
    keys: string[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.searchAndRemoveMany(keys, onComplete);
      },
      [],
      onComplete
    );
  }

  public async searchAndRemoveInstantly(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.searchAndRemoveInstantly(key);
      },
      [],
      onComplete
    );
  }

  public async searchAndRemoveInstantlyMany(
    keys: string[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.searchAndRemoveInstantlyMany(keys);
      },
      [],
      onComplete
    );
  }

  public async searchIndex(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.searchIndex(key);
      },
      [],
      onComplete
    );
  }

  public async rename(
    oldKey: string,
    newKey: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.rename(oldKey, newKey);
      },
      [],
      onComplete
    );
  }

  public async modify(
    key: string,
    value: t,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.modify(key, value);
      },
      [],
      onComplete
    );
  }

  public async modifyMany(
    items: BasketDB.Types.Core.DB.Combo<t>[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.modifyMany(items);
      },
      [],
      onComplete
    );
  }

  public async remove(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.mainDB.remove(key, onComplete);
  }

  public async removeMany(
    keys: string[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    this.mainDB.removeMany(keys, onComplete);
  }

  public async removeInstantly(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.removeInstantly(key);
      },
      [],
      onComplete
    );
  }

  public async removeInstantlyMany(
    keys: string[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.removeInstantlyMany(keys);
      },
      [],
      onComplete
    );
  }

  public async close() {
    await this.trashman.close();
  }
}
