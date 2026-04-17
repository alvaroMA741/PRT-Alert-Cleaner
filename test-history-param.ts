import axios from 'axios';

async function testHistoryParam() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094'; 
  
  try {
    const url = `https://api.proranktracker.com/v3/terms?history=1&term_id=${id}`;
    console.log(`Testing history param: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Success!', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('Failed:', e.response?.status, e.response?.data);
  }
}
testHistoryParam();
