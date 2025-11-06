import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/Api';

const AadharVerification = () => {
  const { user, setUser } = useAuth();
  const [aadharNumber, setAadharNumber] = useState(user?.aadharNumber || '');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setAadharNumber(user?.aadharNumber || '');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aadharNumber && !file) {
      setMessage('Please provide Aadhar number or upload a document');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const form = new FormData();
      if (aadharNumber) form.append('aadharNumber', aadharNumber);
      if (file) form.append('aadhar', file);

      const res = await authAPI.requestAadhar(form);
      setMessage(res.message || 'Requested verification');

      // refresh current user
      const refreshed = await authAPI.me();
      // AuthContext's setUser may be present; call it if available
      if (typeof setUser === 'function') setUser(refreshed);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to request verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <h2 className="text-2xl font-semibold mb-4">Aadhar Verification</h2>

      <div className="max-w-xl bg-white p-6 rounded shadow">
        <p className="mb-4">Current status: <strong>{user?.aadharStatus || 'unverified'}</strong></p>

        {user?.aadharStatus === 'rejected' && (
          <div className="mb-4 text-sm text-red-700">Reason: {user.aadharRejectedReason}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Aadhar Number (optional)</label>
          <input
            className="w-full border p-2 rounded mb-3"
            value={aadharNumber}
            onChange={(e) => setAadharNumber(e.target.value)}
            placeholder="XXXX-XXXX-XXXX"
          />

          <label className="block mb-2">Upload Aadhar (image or PDF)</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4"
          />

          <div className="flex space-x-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Request Verification'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFile(null);
                setAadharNumber(user?.aadharNumber || '');
                setMessage('');
              }}
            >
              Reset
            </button>
          </div>
        </form>

        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default AadharVerification;
