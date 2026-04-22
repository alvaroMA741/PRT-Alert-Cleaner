import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/prt/rankings', async (req, res) => {
    const { apiKey, alerts } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key (X-TOKEN) is required' });
    }

    try {
      const headers = {
        'X-TOKEN': apiKey.trim(),
        'Accept': 'application/json'
      };

      const urlMap = new Map<string, string>();
      
      // 1. Try to get url -> domain mapping from groups (may fail with 404 on some accounts)
      try {
        const groupsRes = await axios.get('https://api.proranktracker.com/v3/groups', { headers });
        if (groupsRes.data?.data) {
          groupsRes.data.data.forEach((g: any) => {
            if (g.urls) {
              g.urls.forEach((u: any) => {
                urlMap.set(u.id.toString(), u.url);
              });
            }
          });
        }
      } catch (e) {
        console.warn('Groups fetch failed (expected for some accounts):', (e as any).message);
      }

      // 2. Fetch all terms/rankings
      let allTerms: any[] = [];
      try {
        // Based on working test-api.ts: /v3/urls provides a bulk url_terms list
        const urlsRes = await axios.get('https://api.proranktracker.com/v3/urls?per_page=10000', { headers });
        const data = urlsRes.data?.data;
        
        if (data) {
          if (data.url_terms && Array.isArray(data.url_terms)) {
            allTerms = data.url_terms;
            // Also update urlMap with any new URLs found here
            if (data.url) urlMap.set(data.id?.toString(), data.url);
          } else if (Array.isArray(data)) {
            // If it's an array of URL objects (standard pagination format)
            data.forEach((u: any) => {
              urlMap.set(u.id.toString(), u.url);
              if (u.url_terms) allTerms = allTerms.concat(u.url_terms.map((t: any) => ({ ...t, domain: u.url })));
            });
          }
        }
      } catch (e) {
        console.warn('Bulk URLs fetch failed, trying per-page fallback:', (e as any).message);
        // Fallback to paged results if bulk fails
        let page = 1;
        let hasMore = true;
        while (hasMore && page <= 10) { // Limit pages for safety
          const pagedRes = await axios.get(`https://api.proranktracker.com/v3/urls?page=${page}&per_page=100`, { headers });
          const items = pagedRes.data?.data;
          if (items && Array.isArray(items)) {
            items.forEach((u: any) => {
              urlMap.set(u.id.toString(), u.url);
              if (u.url_terms) allTerms = allTerms.concat(u.url_terms.map((t: any) => ({ ...t, domain: u.url })));
            });
            if (items.length < 100) hasMore = false;
            else page++;
          } else { hasMore = false; }
        }
      }

      // 3. Fallback to /v3/terms if we still have nothing
      if (allTerms.length === 0) {
        try {
          const termsRes = await axios.get('https://api.proranktracker.com/v3/terms?per_page=1000', { headers });
          allTerms = termsRes.data?.data || [];
        } catch (e) {
          console.error('All term fetch methods failed');
        }
      }

      // Final mapping
      const combinedData = allTerms.map((t: any) => ({
        ...t,
        domain: t.domain || urlMap.get(t.url_id?.toString()) || t.url || '',
        keyword: t.term || t.name || t.keyword || '',
        rank: t.rankings?.google?.day ?? t.rank ?? t.position ?? 'NTH'
      }));

      console.log(`Successfully fetched ${combinedData.length} terms from PRT`);
      res.json({ data: combinedData });

    } catch (error: any) {
      console.error('PRT API Fatal Error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json(
        error.response?.data || { error: 'Failed to process PRT rankings' }
      );
    }
  });

  app.post('/api/prt/history', async (req, res) => {
    const { apiKey, termId, urlId, range = 30 } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    try {
      const headers = {
        'X-TOKEN': apiKey.trim(),
        'Accept': 'application/json'
      };

      const toDate = new Date().toISOString().split('T')[0];
      const fromDate = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      console.log(`[PRT History] Fetching for termId: ${termId}, urlId: ${urlId} (${range} days)`);

      let historyData: any[] = [];
      let success = false;

      // Attempt 1: The documentated URL-based history (MOST RELIABLE)
      if (urlId) {
        try {
          // Note: using 'from' and 'to' as per user's provided parameters
          const url = `https://api.proranktracker.com/v3/urls/history/${urlId}?from=${fromDate}&to=${toDate}`;
          const resH = await axios.get(url, { headers });
          if (resH.data?.result === 'success' && resH.data?.data?.terms) {
            // Find the specific term that matches the keyword we're looking for
            const termMatch = resH.data.data.terms.find((t: any) => 
              String(t.url_term_id) === String(termId) || 
              String(t.term_id) === String(termId)
            );
            
            if (termMatch && termMatch.rankhistory) {
              historyData = termMatch.rankhistory.map((h: any) => ({
                date: h.checked || h.date,
                rank: h.rank ?? 'NTH',
                url: h.matched_url || ''
              }));
              success = historyData.length > 0;
            }
          }
        } catch (e) {
          console.warn(`[PRT History] URL-based attempt failed for urlId: ${urlId}`);
        }
      }

      // Fallback Sequence for older accounts or different configurations
      if (!success) {
        const attemptFetch = async (paramName: string) => {
          try {
            const url = `https://api.proranktracker.com/v3/rankings/history?${paramName}=${termId}&from_date=${fromDate}&to_date=${toDate}`;
            const resH = await axios.get(url, { headers });
            if (resH.data?.result !== 'error' && resH.data?.data) {
              const raw = resH.data.data;
              const mapped = Array.isArray(raw) ? raw : Object.entries(raw).map(([date, val]: any) => ({
                date,
                rank: typeof val === 'object' ? (val.rank ?? val.position) : val,
                url: typeof val === 'object' ? (val.url ?? val.indexed_url ?? val.matched_url) : ''
              }));
              if (mapped.length > 0) {
                historyData = mapped;
                return true;
              }
            }
          } catch (e: any) {}
          return false;
        };

        success = await attemptFetch('url_term_id');
        if (!success) success = await attemptFetch('term_id');
        if (!success) success = await attemptFetch('id');
      }

      const finalHistory = historyData.map((h: any) => {
        let rank = h.rank ?? h.position ?? 'NTH';
        return {
          date: h.date || h.checked || h.day,
          rank: rank,
          url: h.matched_url || h.url || h.indexed_url || ''
        };
      }).filter(h => h.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (finalHistory.length === 0) {
        console.log(`[PRT History] No data found for term ${termId} / url ${urlId}`);
      } else {
        console.log(`[PRT History] Found ${finalHistory.length} records`);
      }
      
      res.json({ data: finalHistory });

    } catch (error: any) {
      console.error('[PRT History] Fatal Error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ error: 'Failed to fetch history' });
    }
  });

  app.post('/api/prt/url-keywords', async (req, res) => {
    const { apiKey, urlId, targetUrl } = req.body;

    if (!apiKey || !urlId) {
      return res.status(400).json({ error: 'API key and urlId are required' });
    }

    const normalizeUrl = (u: string) => {
      if (!u) return '';
      return u.toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '')
        .trim();
    };

    const normTarget = normalizeUrl(targetUrl);

    try {
      const headers = {
        'X-TOKEN': apiKey.trim(),
        'Accept': 'application/json'
      };

      const url = `https://api.proranktracker.com/v3/urls/${urlId}`;
      const resU = await axios.get(url, { headers });
      
      if (resU.data?.result !== 'error' && resU.data?.data) {
        const urlData = resU.data.data;
        const baseUrl = urlData.url || '';
        const terms = Array.isArray(urlData.terms) ? urlData.terms : (urlData.url_terms || []);
        
        const filteredTerms = terms.filter((t: any) => {
          const rawRank = t.rankings?.google?.day ?? t.rank ?? t.position ?? t.yesterdayrank ?? 'NTH';
          let rank = 101;
          if (rawRank !== 'NTH' && rawRank !== null && rawRank !== undefined) {
             rank = parseInt(rawRank.toString(), 10);
             if (isNaN(rank)) rank = 101;
          }

          // Si el rank es 101 (>100), PRT no asocia una URL real, por lo que las ignoramos
          if (rank >= 101) return false;

          // Si no hay matchedurl, PRT a veces devuelve la URL base del dominio por defecto, 
          // lo cual falsea la asociación. Solo aceptamos términos con una URL de destino explícita.
          if (!t.matchedurl) return false;

          return normalizeUrl(t.matchedurl) === normTarget;
        });

        const mappedTerms = filteredTerms.map((t: any) => {
          const rawRank = t.rankings?.google?.day ?? t.rank ?? t.position ?? t.yesterdayrank ?? 'NTH';
          let rank = 101;
          if (rawRank !== 'NTH' && rawRank !== null && rawRank !== undefined) {
             rank = parseInt(rawRank.toString(), 10);
             if (isNaN(rank)) rank = 101;
          }
          
          return {
            keyword: t.term || t.name || t.keyword || '',
            rank: rank,
            combinacion: t.combinacion || t.string || t.location || t.engine || ''
          };
        });
        
        res.json({ data: mappedTerms });
      } else {
        res.json({ data: [] });
      }
    } catch (error: any) {
      console.error('[PRT URL Keywords] Fatal Error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ error: 'Failed to fetch URL keywords' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
