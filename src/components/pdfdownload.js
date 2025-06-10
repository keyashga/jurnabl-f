import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const JournalPDFDownload = ({ 
  userId, 
  userName = "Anonymous User", 
  visibilityOptions = [] 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default visibility options
  const defaultVisibilityOptions = [
    { value: 'private', icon: '🔒', label: 'Private' },
    { value: 'close-circle', icon: '👥', label: 'Close Circle' }
  ];

  const currentVisibilityOptions = visibilityOptions.length > 0 ? visibilityOptions : defaultVisibilityOptions;

  // Fetch journals from database
  const fetchJournals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/journals/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Sort journals by date (newest first)
      const sortedJournals = data.sort((a, b) => 
        new Date(b.journaldate || b.createdAt) - new Date(a.journaldate || a.createdAt)
      );
      
      setJournals(sortedJournals);
    } catch (err) {
      console.error('Error fetching journals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch journals on component mount
  useEffect(() => {
    if (userId) {
      fetchJournals();
    }
  }, [userId]);

  const getVisibilityDisplay = (visibilityValue) => {
    const option = currentVisibilityOptions.find(opt => opt.value === visibilityValue);
    return option || { icon: '🔒', label: 'Private' };
  };

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

  const generatePDF = async () => {
    if (journals.length === 0) {
      alert('No journal entries found to download.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      
      // Generate HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${userName}'s Journal Entries</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Kalam', 'Comic Sans MS', cursive;
              background: #f8f4f0;
              color: #2c3e50;
              line-height: 1.6;
            }
            
            .pdf-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            
            .pdf-header {
              text-align: center;
              margin-bottom: 40px;
              padding: 30px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            
            .pdf-title {
              font-size: 32px;
              color: #2c3e50;
              margin-bottom: 10px;
              font-weight: 700;
            }
            
            .pdf-subtitle {
              font-size: 18px;
              color: #666;
              margin-bottom: 20px;
            }
            
            .pdf-date {
              font-size: 14px;
              color: #888;
            }
            
            .pdf-stats {
              font-size: 16px;
              color: #555;
              margin-top: 15px;
            }
            
            .journal-entry {
              background: white;
              margin-bottom: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              position: relative;
              padding: 60px 40px 40px 80px;
              min-height: 500px;
              page-break-inside: avoid;
            }
            
            .spiral-binding {
              position: absolute;
              left: -30px;
              top: 60px;
              height: calc(100% - 120px);
              width: 30px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 40px;
              padding-top: 20px;
            }
            
            .spiral-hole {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #fff;
              border: 2px solid #ddd;
              box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .margin-line {
              position: absolute;
              left: 70px;
              top: 0;
              bottom: 0;
              width: 2px;
              background: #ff6b6b;
              opacity: 0.3;
            }
            
            .paper-lines {
              position: absolute;
              top: 0;
              left: 80px;
              right: 40px;
              height: 100%;
              pointer-events: none;
              z-index: 0;
            }
            
            .paper-line {
              height: 32px;
              border-bottom: 1px solid #e8f4f8;
              width: 100%;
            }
            
            .date-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 30px;
              position: relative;
              z-index: 1;
            }
            
            .calendar-icon {
              width: 20px;
              height: 20px;
              fill: #666;
            }
            
            .date-text {
              font-size: 18px;
              color: #333;
              margin: 0;
              font-weight: 600;
            }
            
            .time-text {
              font-size: 14px;
              color: #888;
              margin-left: auto;
            }
            
            .author-section {
              margin-bottom: 20px;
              position: relative;
              z-index: 1;
            }
            
            .author-info {
              display: flex;
              align-items: center;
              gap: 12px;
              background: #f8f9fa;
              padding: 12px 16px;
              border-radius: 8px;
              border: 1px solid #e9ecef;
              width: fit-content;
            }
            
            .visibility-badge {
              font-size: 12px;
            }
            
            .anonymous-badge {
              font-size: 12px;
            }
            
            .entry-title {
              font-size: 22px;
              color: #2c3e50;
              font-weight: 600;
              margin-bottom: 20px;
              text-decoration: underline;
              text-decoration-color: #e8f4f8;
              text-underline-offset: 4px;
              position: relative;
              z-index: 1;
            }
            
            .entry-content {
              font-size: 16px;
              color: #2c3e50;
              line-height: 32px;
              margin-bottom: 30px;
              position: relative;
              z-index: 1;
              white-space: pre-wrap;
            }
            
            .content-line {
              min-height: 32px;
              display: flex;
              align-items: baseline;
            }
            
            .entry-stats {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 12px;
              color: #999;
              font-style: italic;
              position: relative;
              z-index: 1;
              padding-top: 10px;
              border-top: 1px solid #f0f0f0;
            }
            
            @media print {
              body {
                background: white;
              }
              
              .journal-entry {
                box-shadow: none;
                border: 1px solid #ddd;
                margin-bottom: 20px;
              }
              
              .pdf-header {
                box-shadow: none;
                border: 1px solid #ddd;
              }
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            <div class="pdf-header">
              <h1 class="pdf-title">📖 My Journal Entries</h1>
              <p class="pdf-subtitle">By ${userName}</p>
              <p class="pdf-date">Generated on ${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <div class="pdf-stats">
                <strong>${journals.length}</strong> entries • 
                <strong>${journals.reduce((total, journal) => total + (journal.content?.length || 0), 0).toLocaleString()}</strong> characters •
                <strong>${journals.reduce((total, journal) => total + (journal.content?.trim().split(/\s+/).filter(word => word.length > 0).length || 0), 0).toLocaleString()}</strong> words
              </div>
            </div>
            
            ${journals.map(journal => {
              const visibilityInfo = getVisibilityDisplay(journal.visibility);
              return `
                <div class="journal-entry">
                  <div class="spiral-binding">
                    ${[...Array(8)].map(() => '<div class="spiral-hole"></div>').join('')}
                  </div>
                  <div class="margin-line"></div>
                  <div class="paper-lines">
                    ${[...Array(25)].map(() => '<div class="paper-line"></div>').join('')}
                  </div>
                  
                  <div class="date-header">
                    <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <h1 class="date-text">${formatDate(journal.journaldate || journal.createdAt)}</h1>
                    <span class="time-text">${formatTime(journal.createdAt || journal.journaldate)}</span>
                  </div>
                  
                  <div class="author-section">
                    <div class="author-info">
                      <div class="author-details">
                        <div class="author-meta">
                          <span class="visibility-badge">
                            ${visibilityInfo.icon} ${visibilityInfo.label}
                          </span>
                          ${journal.isAnonymous ? '<span> • </span><span class="anonymous-badge">👤 Anonymous</span>' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h2 class="entry-title">${journal.title || 'Untitled Entry'}</h2>
                  
                  <div class="entry-content">
                    ${journal.content ? journal.content.split('\n').map(line => 
                      `<div class="content-line">${line || '&nbsp;'}</div>`
                    ).join('') : 'No content available.'}
                  </div>
                  
                  <div class="entry-stats">
                    <span>${journal.content?.length || 0} characters • ${(journal.content?.trim().split(/\s+/).filter(word => word.length > 0).length) || 0} words</span>
                    <span>❤️ ${journal.likesCount || 0} • 👁️ ${journal.readsCount || 0}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsGenerating(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <button style={styles.downloadButtonDisabled} disabled>
        <div style={styles.spinner}></div>
        <span>Loading journals...</span>
      </button>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>Error loading journals: {error}</p>
        <button onClick={fetchJournals} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  // Show no journals state
  if (journals.length === 0) {
    return (
      <button style={styles.downloadButtonDisabled} disabled>
        <Download style={styles.downloadIcon} />
        <span>No entries to download</span>
      </button>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.statsInfo}>
        <span style={styles.statsText}>
          {journals.length} entries ready for download
        </span>
      </div>
      <button 
        onClick={generatePDF}
        disabled={isGenerating}
        style={{
          ...styles.downloadButton,
          ...(isGenerating ? styles.downloadButtonDisabled : {})
        }}
      >
        {isGenerating ? (
          <>
            <div style={styles.spinner}></div>
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <Download style={styles.downloadIcon} />
            <span>Download Journal</span>
          </>
        )}
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },

  statsInfo: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'center'
  },

  statsText: {
    fontStyle: 'italic'
  },

  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
    fontFamily: '"Kalam", "Comic Sans MS", cursive'
  },

  downloadButtonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },

  downloadIcon: {
    width: '16px',
    height: '16px'
  },

  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    background: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px'
  },

  errorText: {
    color: '#c33',
    fontSize: '14px',
    margin: 0
  },

  retryButton: {
    padding: '8px 16px',
    background: '#c33',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  }
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default JournalPDFDownload;