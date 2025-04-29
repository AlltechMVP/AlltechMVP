
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../utils/auth';

export default function AuthRoute({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { session } = await getSession();
    if (!session) {
      navigate('/login');
    }
    setLoading(false);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
}
