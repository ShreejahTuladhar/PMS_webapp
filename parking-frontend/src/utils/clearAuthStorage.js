// Utility to clear authentication storage - useful for debugging
export const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('🧹 Cleared auth storage');
};

// Utility to inspect current auth storage
export const inspectAuthStorage = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('🔍 Auth Storage Inspection:');
  console.log('Token:', token ? `${token.substring(0, 20)}...` : 'None');
  console.log('User:', user ? JSON.parse(user) : 'None');
  
  return { token, user };
};

// Auto-run inspection in development
if (process.env.NODE_ENV === 'development') {
  window.clearAuthStorage = clearAuthStorage;
  window.inspectAuthStorage = inspectAuthStorage;
  console.log('🛠️  Auth debugging utilities available: clearAuthStorage(), inspectAuthStorage()');
}