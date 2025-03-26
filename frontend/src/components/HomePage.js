import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../api/axios';
import { FaUser, FaScroll, FaBook, FaMagic } from 'react-icons/fa';
import { useAuth } from '../useAuth';

// Dashboard stat card component
const StatCard = React.memo(({ title, value, icon, color, onClick }) => {
  const Icon = icon;
  return (
    <div 
      className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color} transition-transform hover:scale-102 hover:shadow-lg cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-')} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace('border-', 'text-')}`} />
        </div>
      </div>
    </div>
  );
});

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

// Recent activity component
const ActivityItem = React.memo(({ title, timestamp, type, icon }) => {
  const Icon = icon;
  const formattedTime = new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getTypeStyles = () => {
    switch (type) {
      case 'character':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'saga':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'book':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'spell':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50">
      <div className={`p-2 rounded-full ${getTypeStyles()}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-gray-500">{formattedTime}</p>
      </div>
    </div>
  );
});

ActivityItem.propTypes = {
  title: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired
};

function HomePage() {
  const [stats, setStats] = useState({
    characters: 0,
    sagas: 0,
    books: 0,
    spells: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, this would fetch actual dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get character count
        const charactersResponse = await api.get('/characters');
        const characterCount = charactersResponse.data?.characters?.length || 0;
        
        // For demonstration, generate mock data for other stats
        // In a real app, these would be separate API calls
        setStats({
          characters: characterCount,
          sagas: 0, // Coming soon features
          books: 0,
          spells: 0
        });

        // Generate recent activity based on characters
        if (charactersResponse.data?.characters?.length) {
          const characters = charactersResponse.data.characters;
          const activity = characters.slice(0, 5).map(char => ({
            id: char.id,
            title: `${char.name} updated`,
            timestamp: new Date().toISOString(), // In a real app, this would come from the API
            type: 'character',
            icon: FaUser
          }));
          setRecentActivity(activity);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Display user-specific greeting
  const greeting = useMemo(() => {
    const time = new Date().getHours();
    let greeting = '';
    
    if (time < 12) greeting = 'Good morning';
    else if (time < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    return `${greeting}, ${user?.name || 'Sodalis'}`;
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div className="animate-pulse" data-testid="home-page-loading">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-28 rounded-lg"></div>
          ))}
        </div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg" data-testid="home-page-error">
        <h2 className="text-lg font-semibold mb-2">Error Loading Dashboard</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div data-testid="home-page">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{greeting}</h1>
        <p className="text-gray-600">Here's an overview of your Ars Magica saga management.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Characters" 
          value={stats.characters} 
          icon={FaUser} 
          color="border-blue-500"
          onClick={() => navigate('/characters')}
        />
        <StatCard 
          title="Sagas" 
          value={stats.sagas} 
          icon={FaScroll} 
          color="border-purple-500"
          onClick={() => alert('Coming soon!')}
        />
        <StatCard 
          title="Books" 
          value={stats.books} 
          icon={FaBook} 
          color="border-yellow-500"
          onClick={() => alert('Coming soon!')}
        />
        <StatCard 
          title="Spells" 
          value={stats.spells} 
          icon={FaMagic} 
          color="border-green-500"
          onClick={() => alert('Coming soon!')}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <ActivityItem 
                key={`${activity.id}-${index}`}
                title={activity.title}
                timestamp={activity.timestamp}
                type={activity.type}
                icon={activity.icon}
              />
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No recent activity found.</p>
              <button 
                onClick={() => navigate('/characters')}
                className="mt-2 text-blue-500 hover:text-blue-700 transition-colors"
              >
                Create your first character
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(HomePage);