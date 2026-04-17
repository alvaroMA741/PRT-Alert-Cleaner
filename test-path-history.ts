import axios from 'axios';

async function testPathParam() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  try {
    const url = `https://api.proranktracker.com/v3/rankings/history/${id}`;
    console.log(`Testing: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('--- FOUND PATH PARAM! ---', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
testPathParam();
