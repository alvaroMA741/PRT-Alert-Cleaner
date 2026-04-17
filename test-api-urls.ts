import axios from 'axios';

async function test() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/urls', { headers });
    console.log('Keys:', Object.keys(res.data.data));
    console.log('url_terms length:', res.data.data.url_terms?.length);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
