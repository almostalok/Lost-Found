import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lostItemsAPI } from '../services/Api';

const Lost = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    dateLost: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await lostItemsAPI.getAll();
      setItems(data.reverse()); // Most recent first
    } catch (error) {
      console.error('Error fetching lost items:', error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({
        ...formData,
        image: e.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please login to report a lost item');
      navigate('/login');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await lostItemsAPI.create(formData);
      setSuccess('Lost item reported successfully!');
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        dateLost: '',
        image: null,
      });
      setShowForm(false);
      fetchItems(); // Refresh the list
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to report lost item');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lost Items</h1>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login');
              } else {
                setShowForm(!showForm);
              }
            }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Report Lost Item'}
          </button>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 card p-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4">Report a Lost Item</h2>
            {error && (
              <div className="alert alert-error mb-4 animate-scale-in">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success mb-4 animate-scale-in">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., Lost iPhone 13"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., Electronics, Wallet, Keys"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="form-textarea"
                  placeholder="Describe the item in detail..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Where did you lose it?"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Date Lost
                  </label>
                  <input
                    type="date"
                    name="dateLost"
                    value={formData.dateLost}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Image
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <span className="flex-center">
                    <span className="spinner w-4 h-4 mr-2"></span>
                    Submitting...
                  </span>
                ) : (
                  'Submit'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Items Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <div 
                key={item._id} 
                className="card hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="img-cover h-48"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                )}
                <div className="card-body">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex-between text-sm text-gray-500 mb-2">
                    <span>📍 {item.location || 'Location not specified'}</span>
                    <span>{formatDate(item.dateLost)}</span>
                  </div>
                  {item.category && (
                    <span className="badge badge-primary mb-2">
                      {item.category}
                    </span>
                  )}
                  <div className="flex-between mt-3">
                    <span className={`badge text-xs ${
                      item.status === 'pending' ? 'badge-warning' :
                      item.status === 'matched' ? 'badge-success' :
                      'badge-gray'
                    }`}>
                      {item.status}
                    </span>
                    <Link
                      to={`/lost/${item._id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover-lift"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 card">
            <p className="text-gray-500">No lost items reported yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lost;