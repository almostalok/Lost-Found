import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lostItemsAPI, foundItemsAPI } from '../services/Api';

const Home = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [lost, found] = await Promise.all([
          lostItemsAPI.getAll(),
          foundItemsAPI.getAll(),
        ]);
        // Get the 6 most recent items
        setLostItems(lost.slice(0, 6).reverse());
        setFoundItems(found.slice(0, 6).reverse());
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const ItemCard = ({ item, type, index }) => (
    <div 
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
          <span>{formatDate(item.dateLost || item.dateFound)}</span>
        </div>
        {item.category && (
          <span className="badge badge-primary mb-2">
            {item.category}
          </span>
        )}
        <Link
          to={`/${type}/${item._id}`}
          className="mt-3 inline-block text-indigo-600 hover:text-indigo-800 text-sm font-medium hover-lift"
        >
          View Details →
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white section-lg">
        <div className="container-custom text-center animate-fade-in-up">
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl text-balance">
            Lost & Found Platform
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl text-pretty">
            Helping you reunite with your lost belongings. Report lost items or
            found items to help others.
          </p>
          <div className="mt-8 flex-center space-x-4">
            <Link
              to="/lost"
              className="btn btn-secondary hover-lift"
            >
              Report Lost Item
            </Link>
            <Link
              to="/found"
              className="btn btn-outline text-white border-white hover:bg-white/10 hover-lift"
            >
              Report Found Item
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Items Section */}
      <div className="container-custom section">
        {/* Lost Items */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Recently Lost Items</h2>
            <Link
              to="/lost"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View All →
            </Link>
          </div>
          {lostItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lostItems.map((item, index) => (
                <ItemCard key={item._id} item={item} type="lost" index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 card">
              <p className="text-gray-500">No lost items yet. Be the first to report one!</p>
            </div>
          )}
        </div>

        {/* Found Items */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Recently Found Items</h2>
            <Link
              to="/found"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View All →
            </Link>
          </div>
          {foundItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foundItems.map((item, index) => (
                <ItemCard key={item._id} item={item} type="found" index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 card">
              <p className="text-gray-500">No found items yet. Be the first to report one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;