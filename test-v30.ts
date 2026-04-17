import axios from 'axios';

async function testV30() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  try {
    const url = `https://api.proranktracker.com/v3.0/rankings/history?url_term_id=${id}`;
    console.log(`Testing: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Result!', res.status);
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
testV30();
