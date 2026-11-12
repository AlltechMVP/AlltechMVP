
import { isDev, mockUser } from '../config/dev';
import { supabase } from '../lib/supabase';

export async function getCurrentUser() {
  if (isDev) {
    return mockUser;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function getUserFromStorage() {
  if (isDev) {
    return mockUser;
  }
  
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}
