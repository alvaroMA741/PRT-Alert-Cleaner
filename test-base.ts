import axios from 'axios';

async function testBase() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/rankings/history', { headers });
    console.log('Success!', res.status, res.data);
  } catch (e: any) {
    console.log('Failed:', e.response?.status, e.response?.data);
  }
}
testBase();
