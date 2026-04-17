import axios from 'axios';

async function testSingular() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  const url_id = '1047392';
  
  const urls = [
    `https://api.proranktracker.com/v3/term/history?url_term_id=${id}`,
    `https://api.proranktracker.com/v3/url/history?url_id=${url_id}`,
    `https://api.proranktracker.com/v3/url/history?id=${url_id}`
  ];

  for (const url of urls) {
    try {
      console.log(`Testing singular: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('Result!', res.status, JSON.stringify(res.data).substring(0, 500));
    } catch (e: any) {
      console.log('Failed:', e.response?.status);
    }
  }
}
testSingular();
