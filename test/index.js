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

function makeID(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function doStuff() {
  console.log('Stuff started');

  const dataToAdd = Array.from({ length: 1000 }, () => {
    return {
      key: makeID(10),
      value: { message: makeID(15) },
    };
  });

  await myBasket.splinter(3); // small amount of bags, increase to scale

  await myBasket.fillEmpty();

  // only measure BasketDB stuff
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

  // MASS ADD TEST 1000 AT ONCE
  await myBasket.addMany(dataToAdd, (res) => {
    console.log('Finished mass add');
  });

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

  console.log(`Operation time took: ${(end - start) / 1000}s`);

  console.log(
    `CPU USAGE: ${await myBasket.statReporter.cpuUsage()}% | `,
    `CPU COUNT: ${myBasket.statReporter.cpuCount} |`,
    `MEM USED: ${await myBasket.statReporter.memoryUsed()} MB |`,
    `SIZE: ${await myBasket.statReporter.sizeOnDiskMegabytes()} MB |`
  );

  // await myBasket.close();
}

doStuff();
