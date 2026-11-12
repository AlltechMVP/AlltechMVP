
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthRoute({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('currentUser');
    
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }
    
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return <div role="status" aria-label="Loading authentication">Loading</div>;
  }

  return children;
}
