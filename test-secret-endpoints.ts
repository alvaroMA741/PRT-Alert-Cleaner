import axios from 'axios';

async function testSecretEndpoints() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_term_id = '46620094'; 
  const term_id = '270607';
  
  const endpoints = [
    `https://api.proranktracker.com/v3/rankings/history/${url_term_id}`,
    `https://api.proranktracker.com/v3/terms/${url_term_id}/rankings/history`,
    `https://api.proranktracker.com/v3/rankings/daily-evolution?url_term_id=${url_term_id}`,
    `https://api.proranktracker.com/v3/rankings/evolution?url_term_id=${url_term_id}`,
    `https://api.proranktracker.com/v3/urls/rankings/history?url_term_id=${url_term_id}`,
    `https://api.proranktracker.com/v3/terms/evolution?id=${url_term_id}`
  ];

  for (const url of endpoints) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('WINNER!', res.status, JSON.stringify(res.data).substring(0, 200));
      break;
    } catch (e: any) {
      console.log('Failed:', e.response?.status, e.response?.data || '');
    }
  }
}

testSecretEndpoints();
