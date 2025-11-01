import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lostItemsAPI } from '../services/Api';
import { useAuth } from '../context/AuthContext';

const LostItemDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claims, setClaims] = useState([]);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await lostItemsAPI.getById(id);
        setItem(data);
        
        // If owner, fetch claims
        if (user && data.user && user._id === data.user._id) {
          try {
            const claimsData = await lostItemsAPI.getClaims(id);
            setClaims(claimsData);
          } catch (err) {
            console.error('Failed to fetch claims:', err);
          }
        }
      } catch (error) {
        console.error(error);
        setError('Item not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id, user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClaim = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setClaimLoading(true);
    setError('');
    try {
      await lostItemsAPI.claim(id, claimMessage);
      setShowClaimForm(false);
      setClaimMessage('');
      alert('Claim submitted successfully! The owner will review your request.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleUpdateClaim = async (claimId, status) => {
    try {
      await lostItemsAPI.updateClaim(id, claimId, status);
      // Refresh claims
      const updatedClaims = await lostItemsAPI.getClaims(id);
      setClaims(updatedClaims);
      alert(`Claim ${status}!`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update claim');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Item not found'}</p>
          <Link to="/lost" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
            ← Back to Lost Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/lost"
          className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
        >
          ← Back to Lost Items
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
              }}
            />
          )}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  item.status === 'matched' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>

            {item.category && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded">
                  {item.category}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-gray-900">📍 {item.location || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date Lost</p>
                <p className="text-gray-900">{formatDate(item.dateLost)}</p>
              </div>
            </div>

            {item.description && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                <p className="text-gray-900 whitespace-pre-wrap">{item.description}</p>
              </div>
            )}

            {item.user && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-500">Reported by</p>
                <p className="text-gray-900">{item.user.name || item.user.email}</p>
              </div>
            )}
            {user && item.user && user._id === item.user._id && (
              <div className="mt-4 flex items-center space-x-2">
                <button
                  onClick={async () => {
                    if (!confirm('Delete this lost item? This cannot be undone.')) return;
                    try {
                      await lostItemsAPI.delete(item._id);
                      navigate('/lost');
                    } catch (err) {
                      console.error(err);
                      setError(err.response?.data?.message || 'Failed to delete item');
                    }
                  }}
                  className="btn btn-danger"
                >
                  Delete Item
                </button>
              </div>
            )}

            {/* Claim button for non-owners */}
            {user && item.user && user._id !== item.user._id && (
              <div className="claim-section mt-4">
                {!showClaimForm ? (
                  <button 
                    onClick={() => setShowClaimForm(true)}
                    className="claim-btn bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    This is My Item - Request to Claim
                  </button>
                ) : (
                  <div className="claim-form bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Submit Claim Request</h3>
                    <textarea
                      value={claimMessage}
                      onChange={(e) => setClaimMessage(e.target.value)}
                      placeholder="Please provide details about why this item is yours..."
                      rows="4"
                      className="claim-textarea w-full p-2 border rounded"
                    />
                    <div className="claim-form-actions mt-2 flex space-x-2">
                      <button 
                        onClick={handleClaim}
                        disabled={claimLoading || !claimMessage.trim()}
                        className="submit-claim-btn bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {claimLoading ? 'Submitting...' : 'Submit Claim'}
                      </button>
                      <button 
                        onClick={() => {
                          setShowClaimForm(false);
                          setClaimMessage('');
                        }}
                        className="cancel-claim-btn bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Claims list for owner */}
            {user && item.user && user._id === item.user._id && claims.length > 0 && (
              <div className="claims-list-section mt-6 border-t pt-4">
                <h3 className="text-xl font-semibold mb-4">Claims Received ({claims.length})</h3>
                {claims.map((claim) => (
                  <div key={claim._id} className="claim-item bg-white border rounded-lg p-4 mb-3">
                    <div className="claim-header flex justify-between items-start mb-2">
                      <strong className="text-lg">{claim.claimant?.name || 'Anonymous'}</strong>
                      <span className={`claim-status px-3 py-1 rounded text-sm ${
                        claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </div>
                    <p className="claim-message text-gray-700 mb-2">{claim.message}</p>
                    <p className="claim-date text-sm text-gray-500 mb-1">
                      {formatDate(claim.createdAt)}
                    </p>
                    <p className="claim-contact text-sm">
                      <strong>Email:</strong> {claim.claimant?.email || 'N/A'}
                    </p>
                    {claim.status === 'pending' && (
                      <div className="claim-actions mt-3 flex space-x-2">
                        <button 
                          onClick={() => handleUpdateClaim(claim._id, 'approved')}
                          className="approve-btn bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateClaim(claim._id, 'denied')}
                          className="deny-btn bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostItemDetail;
