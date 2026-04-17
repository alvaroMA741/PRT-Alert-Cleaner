import axios from 'axios';

async function testNested() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1047392';
  const url_term_id = '46620094';
  const term_id = '270607';
  
  const variations = [
    `https://api.proranktracker.com/v3/urls/${url_id}/terms/${url_term_id}/history`,
    `https://api.proranktracker.com/v3/urls/${url_id}/terms/${term_id}/history`,
    `https://api.proranktracker.com/v3/urls/${url_id}/url_terms/${url_term_id}/history`,
    `https://api.proranktracker.com/v3/rankings/history?url_term_id=${url_term_id}`
  ];

  for (const url of variations) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('Got it!', res.status, JSON.stringify(res.data).substring(0, 500));
    } catch (e: any) {
      console.log('Failed:', e.response?.status);
    }
  }
}
testNested();
