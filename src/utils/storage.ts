export const getLocalStorage = (key: string, defaultValue: string): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key) ?? defaultValue;
    }
    return defaultValue;
  };
  
  export const setLocalStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  };