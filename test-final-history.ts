import axios from 'axios';

async function testHistory() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  const urls = [
    `https://proranktracker.com/api/v3/rankings/history?url_term_id=${id}`,
    `https://api.proranktracker.com/v3/rankings/history?url_term_id=${id}`,
    `https://api.proranktracker.com/v3/rankings/history?url_term_id=${id}&from_date=2026-03-18&to_date=2026-04-17`
  ];

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('Got it!', res.status, JSON.stringify(res.data).substring(0, 500));
    } catch (e: any) {
      console.log('Failed:', e.response?.status, e.response?.data);
    }
  }
}
testHistory();
