import axios from 'axios';

async function testDifferentBase() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  const bases = [
    `https://proranktracker.com/api/v3/rankings/history?url_term_id=${id}`,
    `https://api.proranktracker.com/v3/rankings/history?url_term_id=${id}`,
    `https://api.proranktracker.com/v3/rankings/history?id=${id}`
  ];

  for (const url of bases) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('SUCCESS!', res.status, url);
      return;
    } catch (e: any) {
      console.log('Failed:', e.response?.status);
    }
  }
}
testDifferentBase();
