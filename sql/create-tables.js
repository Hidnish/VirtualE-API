import { getConnection } from '../src/database.js';
import async from 'async';
import tables from './tables.js';

async function main() {
  await createTables();
}

const createTables = async () => {
  try {
    const connection = await getConnection();

    async
      .forEachOfSeries(tables, function (table, index, callback) {
        connection.query(table, function (err, result) {
          try {
            callback();
            if (err) throw err;
            const queryNum = index + 1;
            console.log(`query number ${queryNum} got executed!`);
            console.log(queryNum, result);
          } catch (error) {
            console.log(error.message);
            process.exit(1);
          }
          if (!err && index === tables.length - 1) {
            console.log('tables were successfully created!');
          }
        });
      })
      .then(() => {
        process.exit(0);
      });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

main().catch(async (err) => {
  console.log(err);
  process.exit(1);
});
