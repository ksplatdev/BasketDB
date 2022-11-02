const { join } = require('path');

const { default: BasketDB } = require('../dist');

const myBasket = new BasketDB.Basket(join(__dirname, './db.basket'));

async function doStuff() {
  console.log('Stuff started');

  await myBasket.splinter(3); // small amount of bags, increase to scale

  await myBasket.fixEmpty();

  await myBasket.read();

  const start = Date.now();

  await myBasket.add(
    'hi',
    {
      message: 'Hello World!',
    },
    (res) => {}
  );

  await myBasket.search('hi', (res) => {
    console.log('found by key "hi"', res);
  });

  await myBasket.mainDB.write();

  const end = Date.now();

  console.log(
    `Operation time took: ${(end - start) / 1000}s`,
    myBasket.mainDB.data
  );
}

doStuff();
