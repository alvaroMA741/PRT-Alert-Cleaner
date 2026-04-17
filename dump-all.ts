import axios from 'axios';

async function dumpAll() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/urls?per_page=1', { headers });
    console.log('Keys:', Object.keys(res.data));
    console.log('Data Type:', typeof res.data.data);
    if (res.data.data) {
       console.log('Data Sample:', JSON.stringify(res.data.data).substring(0, 500));
    }
  } catch (e: any) {
    console.log('Error:', e.response?.status, e.response?.data);
  }
}
dumpAll();
