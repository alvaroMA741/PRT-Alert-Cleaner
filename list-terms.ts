import axios from 'axios';

async function listTerms() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  
  try {
    const url = 'https://api.proranktracker.com/v3/terms?per_page=1';
    const res = await axios.get(url, { headers });
    console.log('Terms:', JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
listTerms();
