import axios from 'axios';

async function dumpFirst() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/urls?per_page=1', { headers });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
dumpFirst();
