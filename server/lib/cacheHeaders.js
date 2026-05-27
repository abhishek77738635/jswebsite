/**
 * HTTP cache headers for Vercel Edge / browser caching.
 */

function applyCacheHeaders(res, { edgeSeconds = 0, browserSeconds = 0, isPublic = false } = {}) {
  const parts = [];

  if (edgeSeconds > 0 && isPublic) {
    parts.push(`s-maxage=${edgeSeconds}`, 'stale-while-revalidate=60');
  }

  if (browserSeconds > 0) {
    parts.push(`max-age=${browserSeconds}`);
  }

  if (parts.length === 0) {
    res.set('Cache-Control', 'no-store');
    return;
  }

  const visibility = isPublic && edgeSeconds > 0 ? 'public' : 'private';
  res.set('Cache-Control', `${visibility}, ${parts.join(', ')}`);
}

function setDataCacheSource(res, source) {
  if (source) {
    res.set('X-Data-Cache', source);
  }
}

module.exports = {
  applyCacheHeaders,
  setDataCacheSource,
};
