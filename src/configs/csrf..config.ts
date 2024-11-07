import { doubleCsrf } from 'csrf-csrf';

const doubleCsrfOptions = {
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: 'XSRF-TOKEN',
  cookieOptions: {
    httpOnly: true,
    secure:false
  },
  size: 64,
};

const {
  generateToken, // توکن CSRF را تولید می‌کند
  doubleCsrfProtection, // حفاظت CSRF
} = doubleCsrf(doubleCsrfOptions);

export {generateToken,doubleCsrfProtection}