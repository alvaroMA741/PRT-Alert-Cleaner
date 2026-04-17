import axios from 'axios';

async function testFinalBingo() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1213683';
  const term_id = '49887405'; // url_term_id
  
  try {
    const url = `https://api.proranktracker.com/v3/urls/history?url_id=${url_id}&term_id=${term_id}`;
    console.log(`Testing: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('--- FOUND? ---');
    console.log('Result!', res.status, JSON.stringify(res.data));
  } catch (e: any) {
    console.log('Failed:', e.response?.status, e.response?.data);
  }
}
testFinalBingo();
