import axios from 'axios';

async function listReports() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  
  try {
    const url = 'https://api.proranktracker.com/v3/reports';
    const res = await axios.get(url, { headers });
    console.log('Reports:', JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
listReports();
