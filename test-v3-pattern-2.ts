import axios from 'axios';

async function testV3Pattern2() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1047392';
  const url_term_id = '46620094';
  
  try {
    const url = `https://api.proranktracker.com/v3/urls/${url_id}/history?term_id=${url_term_id}`;
    console.log(`Testing: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('--- BINGO! ---');
    console.log('Status:', res.status);
    console.log('Data:', JSON.stringify(res.data).substring(0, 1000));
  } catch (e: any) {
    console.log('Failed:', e.response?.status, e.response?.data);
  }
}
testV3Pattern2();
