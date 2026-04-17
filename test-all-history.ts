import axios from 'axios';

async function testAllHistory() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/urls?per_page=10', { headers });
    const terms = res.data.data.url_terms || [];
    console.log(`Found ${terms.length} terms.`);
    
    for (const term of terms) {
        const id = term.url_term_id;
        try {
            console.log(`Testing history for url_term_id: ${id}`);
            const resH = await axios.get(`https://api.proranktracker.com/v3/rankings/history?url_term_id=${id}`, { headers });
            console.log('SUCCESS for ID:', id);
            return;
        } catch (e: any) {
            console.log(`Failed for ${id}: ${e.response?.status}`);
        }
    }
  } catch (e: any) {
    console.log('Main fetch failed');
  }
}
testAllHistory();
