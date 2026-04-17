import axios from 'axios';

async function testTermDetails() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_term_id = '46620094'; 
  
  try {
    const res = await axios.get(`https://api.proranktracker.com/v3/terms/${url_term_id}`, { headers });
    console.log('Term Details (url_term_id):', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('Failed url_term_id:', e.response?.status);
  }

  try {
    const res = await axios.get(`https://api.proranktracker.com/v3/urls/1047392`, { headers });
    console.log('URL Details:', res.status, JSON.stringify(res.data).substring(0, 1000));
  } catch (e: any) {
    console.log('Failed URL id:', e.response?.status);
  }
}
testTermDetails();
