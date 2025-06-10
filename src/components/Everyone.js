import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Eye, User, MapPin, Clock, BookOpen, Loader } from 'lucide-react';
import './css/public.css'
import axios from 'axios';

const Public = () => {
  const [journals, setJournals] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);

  // Get auth token (adjust this based on how you store authentication)
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Fetch user's liked journals
  const fetchUserLikes = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/journal/user/likes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLikedPosts(new Set(data.likedJournals || []));
      }
    } catch (err) {
      console.error('Error fetching user likes:', err);
    }
  };

  // Fetch public journals from API
  const fetchJournals = async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const token = getAuthToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/journal/public?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (append) {
        setJournals(prev => [...prev, ...data.journals]);
      } else {
        setJournals(data.journals);
      }
      
      setHasMore(data.hasMore);
      setCurrentPage(data.currentPage);
      setError(null);
    } catch (err) {
      console.error('Error fetching journals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle like/unlike
  const handleLike = async (journalId) => {
    try {
      const token = getAuthToken();
      const isLiked = likedPosts.has(journalId);

       setLikedPosts(prev => {
        const newLiked = new Set(prev);
        if (isLiked) {
          newLiked.delete(journalId);
        } else {
          newLiked.add(journalId);
        }
        return newLiked;
      });
      
      let response;
      
      if (isLiked) {
        // Unlike request
        response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/journal/${journalId}/like`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Like request
        response = await axios.post(`${process.env.REACT_APP_API_URL}/api/journal/${journalId}/like`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      const data = response.data;
      
      // Update the journal's like count in the local state
      setJournals(prev => prev.map(journal => 
        journal._id === journalId 
          ? { ...journal, likes: data.likesCount }
          : journal
      ));

    } catch (err) {
      console.error('Error toggling like:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      // Show user-friendly error message
      if (err.response?.status === 400 && err.response?.data?.message === 'Already liked') {
        console.log('This post is already liked. Please refresh the page.');
      }
    }
  };

  // Load more journals
  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchJournals(currentPage + 1, true);
    }
  };

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchJournals(),
        fetchUserLikes()
      ]);
    };
    
    initializeData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="public-container">
        <div className="loading-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <Loader className="animate-spin" size={32} />
          <p>Loading public stories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="public-container">
        <div className="error-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          flexDirection: 'column',
          gap: '1rem',
          color: '#ef4444'
        }}>
          <p>Error loading journals: {error}</p>
          <button 
            onClick={() => {
              fetchJournals();
              fetchUserLikes();
            }} 
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!journals.length) {
    return (
      <div className="public-container">
        <div className="public-header">
          <div className="header-content-public">
            <p className="header-subtitle-public">
              "Stories from around the world, shared with everyone"
            </p>
          </div>
        </div>
        <div className="empty-state" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          flexDirection: 'column',
          gap: '1rem',
          color: '#6b7280'
        }}>
          <BookOpen size={48} />
          <p>No public stories yet.</p>
          <p>Be the first to share your story with the world!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-container">
      {/* Header */}
      <div className="public-header">
        <div className="header-content-public">
          <p className="header-subtitle-public">
            "Stories from around the world, shared with everyone"
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content-public">
        <div className="journals-container-public">
          {journals.map((journal, index) => (
            <div key={journal._id} className="journal-wrapper-public">
              {/* Diary Page */}
              <div className="diary-page-public">
                {/* Notebook Lines */}
                <div className="notebook-lines"></div>
                <div className="dotted-lines"></div>
                
                {/* Red Margin Line */}
                <div className="margin-line-public"></div>

                {/* Date Tab */}
                <div className="date-tab">
                  <div className="date-tab-content">
                    <Calendar className="date-icon" />
                    <span>{formatDate(journal.journaldate)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="page-content-public">
                  {/* Author Info */}
                  <div className="author-info">
                    {journal.isAnonymous || !journal.author ? (
                      <div className="anonymous-avatar-public">
                        <User className="anonymous-icon-public" />
                      </div>
                    ) : (
                      <img
                        src={journal.author.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${journal.author.name}`}
                        alt={journal.author.name}
                        className="author-avatar-public"
                      />
                    )}
                    <div className="author-details-public">
                      <h3 className="author-name-public">
                        {journal.isAnonymous || !journal.author ? 'Anonymous Writer' : journal.author.name}
                      </h3>
                      <div className="author-meta">
                        <Clock className="meta-icon" />
                        <span>{formatTime(journal.createdAt)}</span>
                        {!journal.isAnonymous && journal.author && journal.author.location && (
                          <>
                            <span className="meta-separator">•</span>
                            <MapPin className="meta-icon" />
                            <span>{journal.author.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="journal-title-public">{journal.title}</h2>
                  
                  {/* Content */}
                  <div className="journal-content-public">
                    <p>{journal.content}</p>
                  </div>
                  
                  {/* Images */}
                  {journal.images && journal.images.length > 0 && (
                    <div className="journal-image-container-public">
                      <img
                        src={journal.images[0]}
                        alt="Memory captured"
                        className="journal-image-public"
                      />
                    </div>
                  )}

                  {/* Bottom Section */}
                  <div className="journal-footer-public">
                    <button
                      onClick={() => handleLike(journal._id)}
                      className={`like-button ${likedPosts.has(journal._id) ? 'liked' : ''}`}
                    >
                      <Heart className={`heart-icon ${likedPosts.has(journal._id) ? 'filled' : ''}`} />
                      <span>
                        {journal.likes || 0} hearts
                      </span>
                    </button>
                    
                    <div className="reads-count">
                      <Eye className="eye-icon" />
                      <span>{Math.round(journal.reads/2) || 0} reads</span>
                    </div>
                  </div>
                </div>

                {/* Paper Curl Effect */}
                <div className="paper-curl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="load-more-container">
            <button 
              className="load-more-button"
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                opacity: loadingMore ? 0.7 : 1,
                cursor: loadingMore ? 'not-allowed' : 'pointer'
              }}
            >
              {loadingMore ? (
                <>
                  <Loader className="animate-spin" size={16} style={{ marginRight: '0.5rem' }} />
                  Loading...
                </>
              ) : (
                'Load more...'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Public;