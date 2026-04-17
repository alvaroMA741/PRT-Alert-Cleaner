import axios from 'axios';

async function testDesperate() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  const endpoints = [
    `https://api.proranktracker.com/v3/terms/history?id=${id}`,
    `https://api.proranktracker.com/v3/terms/${id}/history`,
    `https://api.proranktracker.com/v3/evolution/${id}`,
    `https://api.proranktracker.com/v3/rankings/evolution?id=${id}`,
    `https://api.proranktracker.com/v3/rankings-evolution?id=${id}`,
    `https://api.proranktracker.com/v3/url_terms/${id}/history`
  ];

  for (const url of endpoints) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('BINGO!', res.status, JSON.stringify(res.data).substring(0, 500));
      return;
    } catch (e) {
      //
    }
  }
}
testDesperate();
