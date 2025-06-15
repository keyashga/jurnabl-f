import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Eye, User, Clock, Edit3, Trash2 } from 'lucide-react';

const JournalDisplay = ({ journal, visibilityOptions, onEdit, onDelete }) => {
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [journalStats, setJournalStats] = useState({
    likes: 0,
    reads: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock data loading simulation
  useEffect(() => {
    const loadData = async () => {
      // Simulate API calls
      setTimeout(() => {
        setJournalStats({
          likes: journal?.likes || Math.floor(Math.random() * 50),
          reads: journal?.reads || Math.floor(Math.random() * 200)
        });
        setLoading(false);
      }, 500);
    };
    
    loadData();
  }, [journal]);

  // Handle like/unlike (mock implementation)
  const handleLike = () => {
    const isLiked = likedPosts.has(journal?._id || 'mock-id');
    
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (isLiked) {
        newLiked.delete(journal?._id || 'mock-id');
      } else {
        newLiked.add(journal?._id || 'mock-id');
      }
      return newLiked;
    });

    setJournalStats(prev => ({
      ...prev,
      likes: isLiked ? prev.likes - 1 : prev.likes + 1
    }));
  };

  const getVisibilityDisplay = (visibilityValue) => {
    const option = visibilityOptions?.find(opt => opt.value === visibilityValue);
    return option || { icon: '🔒', label: 'Private' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString || Date.now());
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString || Date.now());
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Preserve line breaks and spacing in content
  const formatContent = (content) => {
    if (!content) return '';
    
    return content.split('\n').map((line, index) => (
      <div key={index} style={styles.contentLine}>
        {line || '\u00A0'} {/* Non-breaking space for empty lines */}
      </div>
    ));
  };

  const visibilityInfo = getVisibilityDisplay(journal?.visibility);
  const isLiked = likedPosts.has(journal?._id || 'mock-id');

  return (
    <div style={styles.container}>
      

      <div style={styles.diaryPage}>
        {/* Red margin line */}
        <div style={styles.marginLine}></div>
        
        {/* Date header */}
        <div style={styles.dateHeader}>
          <Calendar style={styles.calendarIcon} />
          <h1 style={styles.dateText}>{formatDate(journal?.journaldate || journal?.createdAt)}</h1>
          <span style={styles.timeText}>{formatTime(journal?.createdAt || journal?.journaldate)}</span>
        </div>

        {/* Lined paper effect */}
        <div style={styles.paperLines}>
          {[...Array(25)].map((_, i) => (
            <div key={i} style={styles.paperLine}></div>
          ))}
        </div>

        {/* Author info section */}
        <div style={styles.authorSection}>
          <div style={styles.authorInfo}>
            
            <div style={styles.authorDetails}>
              <div style={styles.authorMeta}>
                <span style={styles.visibilityBadge}>
                  {visibilityInfo.icon} {visibilityInfo.label}
                </span>
                {journal?.isAnonymous && (
                  <>
                    <span style={styles.metaSeparator}>•</span>
                    <span style={styles.anonymousBadge}>👤 Anonymous</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Title section */}
        <div style={styles.titleSection}>
          <h2 style={styles.titleText}>{journal?.title || 'Untitled Entry'}</h2>
        </div>

        {/* Content section */}
        <div style={styles.contentSection}>
          <div style={styles.contentDisplay}>
            {formatContent(journal?.content || 'No content available.')}
          </div>
        </div>

        {/* Image section */}
        {journal?.images && journal.images.length > 0 && (
          <div style={styles.imageContainer}>
            <img 
              src={journal.images[0]} 
              alt="Memory captured" 
              style={styles.imageDisplay} 
            />
            <div style={styles.imageCorners}>
              <div style={styles.imageCorner}></div>
              <div style={styles.imageCorner}></div>
              <div style={styles.imageCorner}></div>
              <div style={styles.imageCorner}></div>
            </div>
          </div>
        )}

        {/* Bottom stats - handwritten style */}
        <div style={styles.statsSection}>
          <div style={styles.statsText}>
            {journal?.content?.length || 0} characters • {(journal?.content?.trim().split(/\s+/).filter(word => word.length > 0).length) || 0} words
          </div>
        </div>

        {/* Action buttons section - moved to bottom */}
        <div style={styles.actionsSection}>
          

          <div style={styles.actionButtons}>
            {onEdit && (
              <button onClick={onEdit} style={styles.editButton}>
                <Edit3 style={styles.editIcon} />
                <span>Edit</span>
              </button>
            )}
            
            {onDelete && (
              <button onClick={onDelete} style={styles.deleteButton}>
                <Trash2 style={styles.deleteIcon} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f4f0',
    fontFamily: '"Kalam", "Comic Sans MS", sans-serif',
    padding: '0rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'relative',
  },

  
  diaryPage: {
    width: '600px',
    minHeight: '800px',
    background: '#fff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px #e5e5e5',
    position: 'relative',
    padding: '60px 40px 40px 80px',
    marginLeft: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },

  marginLine: {
    position: 'absolute',
    left: '2rem',
    top: '0',
    bottom: '0',
    width: '2px',
    background: '#ff6b6b',
    opacity: 0.3
  },

  paperLines: {
    position: 'absolute',
    top: '0',
    left: '2.5rem',
    right: '40px',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0
  },

  paperLine: {
    height: '32px',
    borderBottom: '1px solid #e8f4f8',
    width: '100%'
  },

  dateHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '30px',
    position: 'relative',
    zIndex: 1
  },

  calendarIcon: {
    width: '20px',
    height: '20px',
    color: '#666'
  },

  dateText: {
    fontSize: '18px',
    color: '#333',
    margin: '0',
    fontWeight: '600'
  },

  timeText: {
    fontSize: '14px',
    color: '#888',
    marginLeft: 'auto'
  },

  authorSection: {
    marginBottom: '20px',
    position: 'relative',
    zIndex: 1
  },

  authorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#f8f9fa',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
    width: 'fit-content'
  },

  anonymousAvatar: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #fde68a, #f59e0b)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },

  userIcon: {
    width: '16px',
    height: '16px',
    color: '#92400e'
  },

  authorAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '2px solid rgba(245, 158, 11, 0.5)'
  },

  authorDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  authorName: {
    fontSize: '14px',
    color: '#495057',
    fontWeight: '600'
  },

  authorMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#6c757d'
  },

  visibilityBadge: {
    fontSize: '12px'
  },

  metaSeparator: {
    color: '#adb5bd'
  },

  anonymousBadge: {
    fontSize: '12px'
  },

  titleSection: {
    marginBottom: '20px',
    position: 'relative',
    zIndex: 1
  },

  titleText: {
    fontSize: '22px',
    fontFamily: 'inherit',
    color: '#2c3e50',
    fontWeight: '600',
    lineHeight: '32px',
    margin: '0',
    textDecoration: 'underline',
    textDecorationColor: '#e8f4f8',
    textUnderlineOffset: '4px'
  },

  greetingSection: {
    marginBottom: '20px',
    position: 'relative',
    zIndex: 1
  },

  greeting: {
    fontSize: '18px',
    fontStyle: 'italic',
    color: '#5d4e75',
    fontWeight: '500'
  },

  contentSection: {
    position: 'relative',
    zIndex: 1,
    marginBottom: '30px',
    flex: 1
  },

  contentDisplay: {
    fontSize: '16px',
    fontFamily: 'inherit',
    color: '#2c3e50',
    lineHeight: '32px',
    minHeight: '200px',
    whiteSpace: 'pre-wrap'
  },

  contentLine: {
    minHeight: '32px',
    display: 'flex',
    alignItems: 'baseline'
  },

  imageContainer: {
    position: 'relative',
    marginBottom: '30px',
    width: 'fit-content',
    zIndex: 1
  },

  imageDisplay: {
    maxWidth: '300px',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },

  imageCorners: {
    position: 'absolute',
    top: '-4px',
    left: '-4px',
    right: '-4px',
    bottom: '-4px',
    pointerEvents: 'none'
  },

  imageCorner: {
    position: 'absolute',
    width: '16px',
    height: '16px',
    background: '#fff',
    border: '1px solid #ddd'
  },

  statsSection: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'right',
    marginBottom: '20px'
  },

  statsText: {
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic'
  },

  actionsSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '20px 0',
    borderTop: '1px solid #e9ecef',
    position: 'relative',
    zIndex: 1,
    marginTop: 'auto'
  },

  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #dee2e6',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#495057',
    transition: 'all 0.2s ease'
  },

  likedButton: {
    background: 'rgba(254, 226, 226, 0.8)',
    color: '#dc3545',
    borderColor: '#f5c6cb'
  },

  heartIcon: {
    width: '16px',
    height: '16px',
    transition: 'all 0.2s ease'
  },

  heartIconFilled: {
    fill: 'currentColor'
  },

  readsCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#6c757d',
    fontSize: '14px'
  },

  eyeIcon: {
    width: '16px',
    height: '16px'
  },

  actionButtons: {
    display: 'flex',
    gap: '12px'
  },

  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #28a745',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#28a745',
    transition: 'all 0.2s ease'
  },

  editIcon: {
    width: '14px',
    height: '14px'
  },

  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #dc3545',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#dc3545',
    transition: 'all 0.2s ease'
  },

  deleteIcon: {
    width: '14px',
    height: '14px'
  }
};

export default JournalDisplay;