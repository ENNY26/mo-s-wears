// utils/squareSDK.js
export const loadSquareSdk = () => {
  return new Promise((resolve, reject) => {
    if (window.Square) {
      resolve(window.Square);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.onload = () => resolve(window.Square);
    script.onerror = () => reject(new Error('Failed to load Square SDK'));
    document.head.appendChild(script);
  });
};