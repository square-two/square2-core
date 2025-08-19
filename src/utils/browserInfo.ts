export type BrowserType = 'Chrome' | 'Firefox' | 'Internet Explorer' | 'Safari' | 'Unknown';

/**
 * Get the browser that the game is running in.
 * @returns The current browser.
 */
export function getBrowser(): BrowserType {
  const agent = navigator.userAgent;
  if (agent.includes('Safari') && agent.includes('Chrome')) {
    return 'Safari';
  }

  if (agent.includes('Chrome')) {
    return 'Chrome';
  }

  if (agent.includes('Firefox')) {
    return 'Firefox';
  }

  if (agent.includes('MSIE') || agent.includes('Trident/')) {
    return 'Internet Explorer';
  }

  return 'Unknown';
}

/**
 * Check if the game is running in a mobile browser.
 * @returns True if the game is running in a mobile browser.
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
