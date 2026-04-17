import axios from 'axios';

async function testHistoryV3() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_term_id = '46620094'; 
  
  const urls = [
    `https://api.proranktracker.com/v3/report/history?url_term_id=${url_term_id}`,
    `https://api.proranktracker.com/v3/report/history?term_id=${url_term_id}`,
    `https://api.proranktracker.com/v3/rankings/history?term_id=${url_term_id}`,
    `https://api.proranktracker.com/v3/rankings/history?url_term_id=${url_term_id}`,
    `https://api.proranktracker.com/v3/terms/${url_term_id}/history`
  ];

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('Success:', res.status, JSON.stringify(res.data).substring(0, 100));
      if (res.data.success || res.status === 200) {
        console.log('FULL DATA:', JSON.stringify(res.data, null, 2).substring(0, 500));
      }
    } catch (e: any) {
      console.log('Failed:', e.response?.status);
    }
  }
}

testHistoryV3();
