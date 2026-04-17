import axios from 'axios';

async function testLegacyHistory() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  try {
    const url = `https://proranktracker.com/api/v1/history/rankings?url_term_id=${id}`;
    console.log(`Testing: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Result!', res.status, JSON.stringify(res.data));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
testLegacyHistory();
