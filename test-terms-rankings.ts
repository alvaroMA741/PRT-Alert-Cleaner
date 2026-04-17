import axios from 'axios';

async function testTermsRankings() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094'; 
  
  try {
    const url = `https://api.proranktracker.com/v3/terms/${id}/rankings`;
    console.log(`Testing terms id rankings: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Success!', res.status, JSON.stringify(res.data).substring(0, 1000));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
testTermsRankings();
