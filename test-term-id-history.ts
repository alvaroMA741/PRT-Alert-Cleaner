import axios from 'axios';

async function testTermIdHistory() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const term_id = '270607';
  
  const urls = [
    `https://api.proranktracker.com/v3/terms/${term_id}/history`,
    `https://api.proranktracker.com/v3/terms/${term_id}/rankings`,
    `https://api.proranktracker.com/v3/terms/${term_id}/evolution`,
    `https://api.proranktracker.com/v3/rankings/history?term_id=${term_id}`,
    `https://api.proranktracker.com/v3/rankings/history?id=${term_id}`
  ];

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('Got it!', res.status, JSON.stringify(res.data).substring(0, 500));
    } catch (e: any) {
      console.log('Failed:', e.response?.status);
    }
  }
}
testTermIdHistory();
