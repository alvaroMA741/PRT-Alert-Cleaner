import axios from 'axios';

async function testUrlChildren() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1047392';
  
  const children = ['terms', 'url_terms', 'rankings', 'history'];

  for (const child of children) {
    const url = `https://api.proranktracker.com/v3/urls/${url_id}/${child}`;
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('Result!', res.status, JSON.stringify(res.data).substring(0, 500));
    } catch (e: any) {
      console.log('Failed:', e.response?.status);
    }
  }
}
testUrlChildren();
