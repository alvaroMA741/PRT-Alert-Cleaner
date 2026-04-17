import axios from 'axios';

async function testEndpoints() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const termId = '46620094'; 
  const toDate = new Date().toISOString().split('T')[0];
  const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const endpoints = [
    `https://api.proranktracker.com/v3/rankings/history?term_id=${termId}&from_date=${fromDate}&to_date=${toDate}`,
    `https://api.proranktracker.com/v3/terms/${termId}/history?from_date=${fromDate}&to_date=${toDate}`,
    `https://api.proranktracker.com/v3/rankings?term_id=${termId}&history=1`,
    `https://api.proranktracker.com/v3/urls/history?term_id=${termId}`,
    `https://api.proranktracker.com/v3/terms/history?id=${termId}`
  ];

  for (const url of endpoints) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('Success!', res.status, JSON.stringify(res.data).substring(0, 100));
      break;
    } catch (e: any) {
      console.log('Failed:', e.response?.status);
    }
  }
}

testEndpoints();
