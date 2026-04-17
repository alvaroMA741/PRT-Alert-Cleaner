import axios from 'axios';

async function test() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/rankings', { headers });
    console.log('Rankings:', res.status);
  } catch (e: any) {
    console.log('Rankings Error:', e.response?.status, e.response?.data);
  }
}
test();
