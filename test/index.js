const { join } = require('path');

const { default: BasketDB } = require('../dist');

const myBasket = new BasketDB.Basket(
  'myBasket',
  join(__dirname, './db.basket'),
  'object',
  {
    trashmanCollectionIntervalInSeconds: 10,
    dumpPath: join(__dirname, './'),
    debug: {
      log: true,
      warn: true,
      error: true,
    },
  }
);

async function doStuff() {
  console.log('Stuff started');

  await myBasket.splinter(3); // small amount of bags, increase to scale

  await myBasket.fillEmpty();

  const start = Date.now();

  // await myBasket.add(
  //   'hello',
  //   {
  //     message: 'Hello World!',
  //   },
  //   (res) => {}
  // );

  // await myBasket.add(
  //   'bye',
  //   {
  //     message: 'Bye World!',
  //   },
  //   (res) => {}
  // );

  await myBasket.addMany(
    [
      { key: 'hello', value: { message: 'Hello World!' } },
      { key: 'bye', value: { message: 'Bye World!' } },
      { key: 'what up', value: { message: 'What Up World!' } },
    ],
    async (res) => {
      console.log('addMany res', res);
    }
  );

  // // force error and dump
  // await myBasket.add(
  //   'break',
  //   'I forgot the onComplete func so this causes a dump'
  //   // no onComplete func causes dump
  // );

  await myBasket.search('hello', async (res) => {
    console.log('found by key "hello"', res);
  });

  await myBasket.remove('hello', async (res) => {
    console.log('removed hello after 10 seconds', res);
  });

  const end = Date.now();

  console.log('Data: ', myBasket.data);
  console.log(`Operation time took: ${(end - start) / 1000}s`);

  console.log(myBasket.mainDB.data, myBasket.internalBag.oldRepel.data);

  // await myBasket.close();
}

doStuff();
