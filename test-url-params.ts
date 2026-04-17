import axios from 'axios';

async function testUrlParams() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1047392';
  
  const paramNames = [
    'id', 'url_id', 'urlid', 'u_id', 'url_item_id', 'item_id', 'uid', 'url', 'uri'
  ];

  for (const name of paramNames) {
    const url = `https://api.proranktracker.com/v3/urls/history?${name}=${url_id}`;
    try {
      console.log(`Testing param ${name}: ${url}`);
      const res = await axios.get(url, { headers });
      if (!JSON.stringify(res.data).includes('Url is not found')) {
        console.log('BINGO!', name, JSON.stringify(res.data).substring(0, 500));
        return;
      }
    } catch (e) {}
  }
}
testUrlParams();
