import BasketDB from '../..';
import Basket from '../basket';
import Bag from './bag';
import DB from './main/db';

export default class InternalBag<t> extends Bag<t> {
  public oldRepel: DB<t>;

  constructor(basket: Basket<t>, db: DB<t>, id: string) {
    super(basket, db, id);

    this.oldRepel = new DB<t>(
      this.repel.filepath,
      this.repel.type,
      this.basket
    );
  }

  public async sync(data: BasketDB.Types.Core.DB.Schema<t>) {
    this.oldRepel.data = Object.assign({}, data);
  }

  public async close() {
    return this.basket.logger.warn(
      'InternalBags cannot be closed, failed to close'
    );
  }
}
