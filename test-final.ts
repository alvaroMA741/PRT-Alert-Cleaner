import axios from 'axios';

async function testFinal() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  const urls = [
    `https://api.proranktracker.com/v3/rankings/history/${id}`,
    `https://api.proranktracker.com/v3/terms/${id}/history`,
    `https://api.proranktracker.com/v3/history/${id}`,
    `https://api.proranktracker.com/v3/rankings/history?url_term_id=${id}`
  ];

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('Got it!', res.status, JSON.stringify(res.data).substring(0, 100));
    } catch (e: any) {
      console.log('Failed:', e.response?.status);
    }
  }
}
testFinal();
