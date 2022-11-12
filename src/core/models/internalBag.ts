import BasketDB from '../..';
import Basket from '../basket';
import Bag from './bag';
import DB from './misc/db';

export default class InternalBag<
  t extends BasketDB.Types.Core.DB.HiddenProps
> extends Bag<t> {
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
}
