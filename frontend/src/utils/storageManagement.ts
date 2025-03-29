export const clearSessionKeysContaining = (substring: string): void => {
  const keysToRemove: string[] = [];

  // Find all matching keys
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.includes(substring)) {
      keysToRemove.push(key);
    }
  }

  // Remove them
  keysToRemove.forEach((key) => sessionStorage.removeItem(key));
};
