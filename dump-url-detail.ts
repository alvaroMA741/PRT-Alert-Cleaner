import axios from 'axios';

async function dumpUrlDetail() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '49887405';
  
  try {
    const url = `https://api.proranktracker.com/v3/urls/${id}`;
    const res = await axios.get(url, { headers });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
dumpUrlDetail();
