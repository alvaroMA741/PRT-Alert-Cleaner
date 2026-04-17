import axios from 'axios';

async function testTermRankings() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const term_id = '270607';
  
  try {
    const url = `https://api.proranktracker.com/v3/terms/${term_id}/rankings`;
    console.log(`Testing: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Result!', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
testTermRankings();
