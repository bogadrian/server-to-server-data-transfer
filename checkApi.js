const fetch = require('node-fetch-with-proxy');
require('dotenv').config()
exports.checkApi = async () => {
  try {
    // console.log(process.env.apiKey)
    // console.log(process.env.tenantID)
    // console.log(process.env.apiUser)
    const optionsPost = {
      method: 'POST',
      //body: JSON.stringify(dataToPost),
      headers: {
        'x-api-key': process.env.apiKey,
        'x-tenant-id': process.env.tenantID,
        'x-api-user': process.env.apiUser,
        'Content-Type': 'application/json'
      }
    };
    const r = await fetch(
      process.env.baseUrl + '/forms/v1/eusubmissions',
      optionsPost
    );

    return r['status'];
  } catch (err) {
    console.log(err);
  }
};
