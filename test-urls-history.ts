import axios from 'axios';

async function testUrlsHistory() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1047392';
  const url_term_id = '46620094';
  
  const queries = [
    `https://api.proranktracker.com/v3/urls/history?id=${url_id}`,
    `https://api.proranktracker.com/v3/urls/history?url_id=${url_id}`,
    `https://api.proranktracker.com/v3/urls/history?url_term_id=${url_term_id}`,
    `https://api.proranktracker.com/v3/urls/history?term_id=${url_term_id}`,
    `https://api.proranktracker.com/v3/urls/history?url_id=${url_id}&url_term_id=${url_term_id}`
  ];

  for (const url of queries) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('Got it!', res.status, JSON.stringify(res.data).substring(0, 500));
    } catch (e: any) {
      console.log('Failed:', e.response?.status, e.response?.data || '');
    }
  }
}
testUrlsHistory();
