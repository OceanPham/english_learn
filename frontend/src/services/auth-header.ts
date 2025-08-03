export default function authHeader() {
  const userStr = localStorage.getItem('user');
  let user = null;

  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
      return {};
    }
  }

  if (user && user.access_token) {
    return { Authorization: `Bearer ${user.access_token}` };
  } else {
    return {};
  }
} 