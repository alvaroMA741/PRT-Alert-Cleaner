import axios from 'axios';

async function testHistoryPrefixes() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  const urls = [
    `https://api.proranktracker.com/v3/rankings/history?url_term_id=${id}`,
    `https://api.proranktracker.com/v3/rankings/history/${id}`,
    `https://api.proranktracker.com/v3/history/rankings?url_term_id=${id}`,
    `https://api.proranktracker.com/v3/history/url_terms/${id}`,
    `https://api.proranktracker.com/v3/report/daily_evolution?url_term_id=${id}`
  ];

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('FOUND:', res.status, url);
    } catch (e: any) {
      console.log('Failed:', e.response?.status);
    }
  }
}
testHistoryPrefixes();
