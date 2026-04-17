import axios from 'axios';

async function testTypos() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  const params = [
    { url_terms_id: id },
    { urlterm_id: id },
    { url_termid: id },
    { rankings_id: id }
  ];

  for (const p of params) {
    try {
      const url = `https://api.proranktracker.com/v3/rankings/history`;
      console.log(`Testing with ${JSON.stringify(p)}`);
      const res = await axios.get(url, { headers, params: p });
      console.log('Result!', res.status);
    } catch (e) {
      //
    }
  }
}
testTypos();
