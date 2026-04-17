import axios from 'axios';

async function testWithSe() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  const se_id = 11;
  
  try {
    const url = `https://api.proranktracker.com/v3/rankings/history?url_term_id=${id}&se_id=${se_id}`;
    console.log(`Testing with SE: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Result!', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('Failed:', e.response?.status, e.response?.data);
  }
}
testWithSe();
