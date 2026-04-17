import axios from 'axios';

async function verifyId() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const targetId = '49887405';
  
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/urls?per_page=500', { headers });
    const terms = res.data.data.url_terms || [];
    const match = terms.find((t: any) => 
        String(t.url_term_id) === targetId || 
        String(t.term_id) === targetId || 
        String(t.url_id) === targetId
    );
    if (match) {
        console.log('MATCH FOUND!', JSON.stringify(match));
    } else {
        console.log('Target ID not found in urls list');
    }
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
verifyId();
