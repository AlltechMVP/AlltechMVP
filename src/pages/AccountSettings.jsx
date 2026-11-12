
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { supabase } from '@/lib/supabase';

function AccountSettings() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const email = session?.user?.email || '';
  const [name, setName] = useState(session?.user?.user_metadata?.name || '');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const saveName = async () => {
    setSaved(false);
    setSaveError('');
    const { error } = await supabase.auth.updateUser({ data: { name } });
    if (error) {
      setSaveError(error.message);
    } else {
      setSaved(true);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
      <div className="border rounded p-4">
        <label className="block mb-2">
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setSaved(false); }}
            placeholder="Your name"
            className="border p-2 w-full rounded"
          />
        </label>
        <button
          onClick={saveName}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save name
        </button>
        {saved && <p className="text-green-600 mb-2">Name saved.</p>}
        {saveError && <p className="text-red-600 mb-2">{saveError}</p>}
        <label className="block mb-2">
          Email:
          <input type="email" value={email} className="border p-2 w-full rounded" disabled />
        </label>
        <p className="text-sm text-gray-500 mb-2">This is the email you signed in with.</p>
        <button
          onClick={() => navigate('/forgot-password')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}

export default AccountSettings;
