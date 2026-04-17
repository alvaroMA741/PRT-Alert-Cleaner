import axios from 'axios';

async function testFinalDetails() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_term_id = '46620094';
  const term_id = '270607';
  
  try {
    const res = await axios.get(`https://api.proranktracker.com/v3/terms/${term_id}`, { headers });
    console.log('Term ID details:', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('Failed Term ID:', e.response?.status);
  }

  try {
    const res = await axios.get(`https://api.proranktracker.com/v3/url_terms/${url_term_id}`, { headers });
    console.log('URL Term ID details:', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('Failed URL Term ID:', e.response?.status);
  }
}
testFinalDetails();
