import axios from 'axios';

async function testEvolution() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094'; 
  
  try {
    const url = `https://api.proranktracker.com/v3/rankings/evolution?url_term_id=${id}`;
    console.log(`Testing evolution: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Success!', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('Failed:', e.response?.status, e.response?.data);
    
    // Try without url_term_prefix
    try {
      const url2 = `https://api.proranktracker.com/v3/rankings/evolution?id=${id}`;
      console.log(`Testing evolution id: ${url2}`);
      const res2 = await axios.get(url2, { headers });
      console.log('Success id!', res2.status, JSON.stringify(res2.data).substring(0, 500));
    } catch (e2: any) {
      console.log('Failed id:', e2.response?.status);
    }
  }
}
testEvolution();
