export const getFavicon = (url: string): string => {
  const domain = new URL(url).hostname;
  const cacheKey = `favicon_${domain}`;
  
  // Check if favicon is cached in localStorage
  const cachedFavicon = localStorage.getItem(cacheKey);
  if (cachedFavicon) {
    return cachedFavicon;
  }
  
  // Try to get favicon from external services
  let faviconUrl = '';
  try {
    faviconUrl = `https://favicon.im/${domain}`;
  } catch {
    try {
      faviconUrl = `https://favicon.pub/${domain}`;
    } catch {
      faviconUrl = '';
    }
  }
  
  // Cache the favicon URL in localStorage for future use
  if (faviconUrl) {
    localStorage.setItem(cacheKey, faviconUrl);
  }
  
  return faviconUrl;
};

