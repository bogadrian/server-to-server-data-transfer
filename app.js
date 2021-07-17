const fetch = require('node-fetch-with-proxy');
const fs = require('fs');
const moment = require('moment');
require('dotenv').config();
let appInsights = require('applicationinsights');

// appInsights.setup()
// 	.setAutoDependencyCorrelation(true)
// 	.setAutoCollectRequests(true)
// 	.setAutoCollectPerformance(true, true)
// 	.setAutoCollectExceptions(true)
// 	.setAutoCollectDependencies(true)
// 	.setAutoCollectConsole(true)
// 	.setUseDiskRetryCaching(true)
// 	.setSendLiveMetrics(false)
// 	.setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
// appInsights.defaultClient.config.proxyHttpsUrl = 'http://lonproxy.cmck.com:8080'
// appInsights.start();

exports.init = (res, num) => {
  const mapData = {
    Email: res['Matter Partner Email'],
    f9553687302368896: res['Matter Location Code'],
    f6295159456229552: res['Matter Location Name'],
    f6236989642976928: res['Client Number'],
    f7325720049437328: res['Matter Number'],
    f2763001832929040: res['Client Name'],
    f1816931445357968: res['Matter Description'],
    f5089770625269776: res['Matter Partner Initials'],
    f1122358172549840: res['Matter Partner Name'],
    f4079444004488752: res['Matter Partner Department'],
    f5468348660973424: res['Date Matter Partner Left'],
    f5802704360473840: res['Matter Executive Initials'],
    f5124508686570896: res['Matter Executive Name'],
    f7407035564098208: res['Matter Status'],
    f4621018711489648: res['Matter Open Date'],
    f5489661259957504: res['Matter Closed Date'],
    f8567052540701184: res['Is the matter contentious?'],
    f3783465007586608:
      res['Total amount of corporate tax included in sum billed'],
    f7260174644592080:
      res['Total amount of corporate tax included in sum billed'],
    f0577100949649472: res['Percentage of Sum Billed that is Corporate Tax'],
    f0832979341774544: res['Work Type'],
    f6507244848142400: 'BAU'
  };

  makeRow(mapData, num);
};

const makeRow = (row, num) => {
  const respData = [];

  const getTimestamp = row => {
    return moment(row)
      .toDate()
      .getTime();
  };

  const email = row.Email;

  const dataRow = {
    formId: 'e930123e-5ac2-43e4-99df-ae0d18156058',
    endUserInput: {
      f9553687302368896: row.f9553687302368896,
      f6295159456229552: row.f6295159456229552,
      f6236989642976928: row.f6236989642976928,
      f7325720049437328: row.f7325720049437328,
      f2763001832929040: row.f2763001832929040,
      f1816931445357968: row.f1816931445357968,
      f5089770625269776: row.f5089770625269776,
      f1122358172549840: row.f1122358172549840,
      f4079444004488752: row.f4079444004488752,
      ...(!!row.f5468348660973424 && {
        f5468348660973424: getTimestamp(row.f5468348660973424)
      }),
      f5802704360473840: row.f5802704360473840,
      f5124508686570896: row.f5124508686570896,
      f7407035564098208: row.f7407035564098208,
      ...(!!row.f5489661259957504 && {
        f5489661259957504: getTimestamp(row.f5489661259957504)
      }),
      f4621018711489648: getTimestamp(row.f4621018711489648),
      f8567052540701184: row.f8567052540701184,
      f3783465007586608: +row.f3783465007586608,
      f7260174644592080: +row.f7260174644592080,
      f0577100949649472: +row.f0577100949649472,
      f0832979341774544: +row.f0832979341774544
    }
  };
  respData.push({ email, dataRow });

  if (respData.length > 0) {
    postData(respData, num);
  }
};

let rowNum = 0;

const postData = (data, num) => {
  data.forEach(async (row, i) => {
    rowNum++;
    console.log('row', rowNum, num);
    // if (rowNum === num) process.exit();
    const writeToLog = resFromCheck => {
      fs.appendFile(
        'importnew.log',
        moment().format() +
          ',' +
          resFromCheck['status'] +
          ',' +
          resFromCheck['statusText'] +
          ',' +
          row.dataRow.endUserInput.f7325720049437328 +
          ',' +
          row.email +
          '\n',
        function(err) {
          console.log(err);
        }
      );
    };
    console.log(`Process ${process.pid}, has been intrerupted `);

    try {
      const optionsFetch = {
        method: 'GET',
        headers: {
          'x-api-key': process.env.apiKey,
          'x-tenant-id': process.env.tenantID,
          'x-api-user': process.env.apiUser,
          'Content-Type': 'application/json'
        }
      };

      const response = await fetch(
        process.env.baseUrl +
          `/forms/v1/forms/e930123e-5ac2-43e4-99df-ae0d18156058/submissions?query=[[{"field":"'endUserInput'->'f7325720049437328'","op":"=","value":"'${row.dataRow.endUserInput.f7325720049437328}'"}]]&limit=9999`,
        optionsFetch
      );
      const ress = await response.json();
      const dataToPost = row.dataRow;

      if (ress.results.length === 0) {
        // const dataToPost = row.dataRow;
        console.log(
          'YES,' +
            dataToPost.endUserInput.f5124508686570896 +
            ',' +
            dataToPost.endUserInput.f7325720049437328 +
            ',' +
            ress.results.length
        );

        const optionsPost = {
          method: 'POST',
          body: JSON.stringify(dataToPost),
          headers: {
            'x-api-key': process.env.apiKey,
            'x-tenant-id': process.env.tenantID,
            'x-api-user': row.email,
            'Content-Type': 'application/json'
          }
        };

        await fetch(
          process.env.baseUrl + '/forms/v1/eusubmissions',
          optionsPost
        )
          .then(resFromCheck => writeToLog(resFromCheck))
          .catch(err => console.log('there was an error:', err));
      } else {
        console.log(
          'NO,' +
            dataToPost.endUserInput.f5124508686570896 +
            ',' +
            dataToPost.endUserInput.f7325720049437328 +
            ',' +
            ress.results.length
        );
      }
    } catch (err) {
      console.log(err);
    }
  });
};
