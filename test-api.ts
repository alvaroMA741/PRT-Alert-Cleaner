import axios from 'axios';

async function test() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  
  // 1. Fetch groups to get url_id -> url mapping
  const groupsRes = await axios.get('https://api.proranktracker.com/v3/groups', { headers });
  const urlMap = new Map();
  groupsRes.data.data.forEach((g: any) => {
    g.urls.forEach((u: any) => {
      urlMap.set(u.id.toString(), u.url);
    });
  });

  // 2. Fetch all terms
  const termsRes = await axios.get('https://api.proranktracker.com/v3/urls?per_page=10000', { headers });
  const allTerms = termsRes.data.data.url_terms;

  // 3. Find missing url_ids
  const missingIds = new Set<string>();
  allTerms.forEach((t: any) => {
    if (!urlMap.has(t.url_id.toString())) {
      missingIds.add(t.url_id.toString());
    }
  });

  console.log('Missing IDs:', missingIds.size);
  
  // 4. Fetch missing url_ids
  for (const id of missingIds) {
    try {
      const res = await axios.get(`https://api.proranktracker.com/v3/urls/${id}`, { headers });
      urlMap.set(id, res.data.data.url);
    } catch (e) {
      console.log('Error fetching missing ID:', id);
    }
  }

  // 5. Combine
  const combined = allTerms.map((t: any) => ({
    ...t,
    domain: urlMap.get(t.url_id.toString()) || '',
    keyword: t.term || t.name || ''
  }));

  console.log('Combined:', combined.length);
  console.log('Sample:', combined[0]);
}
test();
