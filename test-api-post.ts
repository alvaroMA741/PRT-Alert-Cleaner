import axios from 'axios';

async function test() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  try {
    const res = await axios.post('https://api.proranktracker.com/v3/rankings', {
      url: 'positio.es',
      term: 'posicionamiento web'
    }, { headers });
    console.log('Rankings:', res.status, res.data);
  } catch (e) {
    console.log('Rankings Error:', e.response?.status, e.response?.data);
  }
}
test();
