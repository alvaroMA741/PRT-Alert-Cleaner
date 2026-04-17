import axios from 'axios';

async function test() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/urls', { headers });
    console.log('URLs:', res.status);
  } catch (e: any) {
    console.log('URLs Error:', e.response?.status, e.response?.data);
  }
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/terms', { headers });
    console.log('Terms:', res.status);
  } catch (e: any) {
    console.log('Terms Error:', e.response?.status, e.response?.data);
  }
}
test();
