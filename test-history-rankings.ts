import axios from 'axios';

async function testHistoryRankings() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094'; 
  
  try {
    const url = `https://api.proranktracker.com/v3/history/rankings?term_id=${id}`;
    console.log(`Testing history/rankings: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Success!', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
    
    // Try url_term_id param
    try {
      const url2 = `https://api.proranktracker.com/v3/history/rankings?url_term_id=${id}`;
      console.log(`Testing history/rankings url_term_id: ${url2}`);
      const res2 = await axios.get(url2, { headers });
      console.log('Success 2!', res2.status, JSON.stringify(res2.data).substring(0, 500));
    } catch (e2: any) {
      console.log('Failed 2:', e2.response?.status);
    }
  }
}
testHistoryRankings();
