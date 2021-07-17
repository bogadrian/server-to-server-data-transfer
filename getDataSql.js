const { poolPromise } = require('./db');
require('dotenv').config();
const { Readable } = require('stream');
const { promisify } = require('util');
const { init } = require('./app');
const sleep = promisify(setTimeout);

const { checkApi } = require('./checkApi');

checkApi().then(res => {
  if (typeof res !== 'number') {
    console.log('API unavailable!');
    process.exit();
  }
});

const getDataFromSql = async () => {
  try {
    const pool = await poolPromise;

    console.log(
      'Waiting for the data to come over from db ... It can take a while! Be patient please!'
    );
    const dbResponse = await pool
      .request()
      .query(
        `select * from [dbo].[dac6_matters] where [Matter Partner Initials] in ('ANRZ', 'CHRX')`
      );
    //turn this on for the stored procedure
    //.execute('[dbo].[get_dac6_matters]');

    return dbResponse.recordsets[0];
  } catch (err) {
    console.log(err);
  }
};

const streamData = async () => {
  const data = await getDataFromSql();
  if (data.length === 0) process.exit();
  const num = data.length;
  if (data) {
    const rs = Readable.from(data);
    console.log(data.length);
    let countData = 0;
    for await (let chunck of rs) {
      // countData++;
      // if ((countData == 10000) || (countData == 20000) || (countData == 30000)) {
      //     await sleep(900000);
      //     // console.log(countData)
      //     init(chunck);
      // } else {
      //     await sleep(500);
      //     // console.log(countData)
      //     init(chunck);
      // }

      await sleep(50);
      init(chunck, num);
    }
  }
};
streamData();
