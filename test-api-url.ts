import axios from 'axios';

async function test() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/urls/1047392', { headers });
    console.log('URL Data:', res.data.data);
  } catch (e: any) {
    console.log('Error:', e.message, e.response?.status, e.response?.data);
  }
}
test();
