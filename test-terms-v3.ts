import axios from 'axios';

async function testTermsV3() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/terms?per_page=1', { headers });
    console.log('Terms Response:', res.status, JSON.stringify(res.data).substring(0, 1000));
  } catch (e: any) {
    console.log('Terms Failed:', e.response?.status);
  }
}
testTermsV3();
