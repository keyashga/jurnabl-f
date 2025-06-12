import React from 'react';
import { Calendar, Check, Trash2 } from 'lucide-react';
import useSelectedDayStore from '../../stores/dataStore';

// Mock VisibilitySelector component
const VisibilitySelector = ({
  visibility,
  isAnonymous,
  onVisibilityChange,
  onIsAnonymousChange
}) => {
  return (
    <div style={styles.visibilitySelector}>
      <div style={styles.visibilityGroup}>
        <label style={styles.visibilityLabel}>Share with:</label>
        <select 
          value={visibility} 
          onChange={(e) => onVisibilityChange(e.target.value)}
          style={styles.visibilitySelect}
        >
          <option value="private">Keep Private</option>
          <option value="close-circle">Me & my Friends</option>
        </select>
      </div>

      {visibility === "close-circle" && (
        <div style={styles.anonymousGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => onIsAnonymousChange(e.target.checked)}
              style={styles.checkbox}
            />
            <span>Post anonymously</span>
          </label>
        </div>
      )}
    </div>
  );
};


const JournalForm = ({
  title = "",
  content = "",
  visibility = "private",
  isAnonymous = false,
  image = null,
  isEditing = false,
  isSaved = false,
  visibilityOptions = [],
  onTitleChange = () => {},
  onContentChange = () => {},
  onVisibilityChange = () => {},
  onIsAnonymousChange = () => {},
  onRemoveImage = () => {}
}) => {
  const selectedDay = useSelectedDayStore((state) => state.selectedDay);
  const CHARACTER_LIMIT = 500;
  const [isHeightLimitReached, setIsHeightLimitReached] = React.useState(false);
  const textareaRef = React.useRef(null);

  const getCurrentDate = () => {
    const date = selectedDay || new Date();
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getCurrentTime = () => {
    const date = new Date();
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleContentChange = (newContent) => {
    if (newContent.length <= CHARACTER_LIMIT) {
      onContentChange(newContent);
    }
  };

  const checkHeightLimit = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const isAtLimit = textarea.scrollHeight > textarea.clientHeight;
      setIsHeightLimitReached(isAtLimit);
    }
  };

  const handleKeyPress = (e) => {
    if (isHeightLimitReached) {
      // Allow backspace, delete, arrow keys, and other navigation keys
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'];
      if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }
    }
  };

  const handleTextareaChange = (e) => {
    const newContent = e.target.value;
    
    // Always allow if content is being reduced
    if (newContent.length <= content.length) {
      handleContentChange(newContent);
      // Check height after state update
      setTimeout(checkHeightLimit, 0);
      return;
    }
    
    // For new content, check if we're at height limit
    if (isHeightLimitReached) {
      return; // Don't allow new content
    }
    
    handleContentChange(newContent);
    // Check height after state update
    setTimeout(checkHeightLimit, 0);
  };

  // Check height when content changes
  React.useEffect(() => {
    checkHeightLimit();
  }, [content]);

  const remainingChars = CHARACTER_LIMIT - content.length;
  const isNearLimit = remainingChars <= 50;

  return (
    <div style={styles.container}>
      

      <div style={styles.diaryPage}>
        {/* Red margin line */}
        <div style={styles.marginLine}></div>
        
        {/* Date header */}
        <div style={styles.dateHeader}>
          <Calendar style={styles.calendarIcon} />
          <h1 style={styles.dateText}>{getCurrentDate()}</h1>
          <span style={styles.timeText}>{getCurrentTime()}</span>
          {isSaved && (
            <div style={styles.savedIndicator}>
              <Check style={styles.checkIcon} />
              <span>Saved</span>
            </div>
          )}
        </div>

        {/* Lined paper effect */}
        <div style={styles.paperLines}>
          {[...Array(25)].map((_, i) => (
            <div key={i} style={styles.paperLine}></div>
          ))}
        </div>

        {/* Title section */}
        <div style={styles.titleSection}>
          <input
            type="text"
            placeholder="write a title here..."
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            style={styles.titleInput}
          />
        </div>

        {/* Share settings - compact and positioned */}
        <div style={styles.shareSection}>
          <VisibilitySelector
            visibility={visibility}
            isAnonymous={isAnonymous}
            visibilityOptions={visibilityOptions}
            onVisibilityChange={onVisibilityChange}
            onIsAnonymousChange={onIsAnonymousChange}
          />
        </div>

        {/* Content writing area */}
        <div style={styles.contentSection}>
          <textarea
            ref={textareaRef}
            placeholder="Let your thoughts flow freely onto the page..."
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            style={styles.contentTextarea}
            maxLength={CHARACTER_LIMIT}
          />
        </div>

        {/* Image section */}
        {image && (
          <div style={styles.imageContainer}>
            <img src={image} alt="Memory" style={styles.imageDisplay} />
            <div style={styles.imageCorners}>
              <div style={styles.imageCorner}></div>
              <div style={styles.imageCorner}></div>
              <div style={styles.imageCorner}></div>
              <div style={styles.imageCorner}></div>
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={onRemoveImage}
                style={styles.removeImageButton}
                title="Remove photo"
              >
                <Trash2 style={styles.trashIcon} />
              </button>
            )}
          </div>
        )}

        {/* Bottom stats - handwritten style */}
        <div style={styles.statsSection}>
          <div style={{
            ...styles.statsText,
            color: isNearLimit ? '#ff6b6b' : '#999'
          }}>
            {content.length}/{CHARACTER_LIMIT} characters • {content.trim().split(/\s+/).filter(word => word.length > 0).length} words
            {isNearLimit && (
              <span style={styles.limitWarning}>
                {remainingChars === 0 ? ' • Character limit reached!' : ` • ${remainingChars} characters remaining`}
              </span>
            )}
          </div>
          {isHeightLimitReached && (
            <div style={styles.heightLimitWarning}>
              Maximum writing space reached!
            </div>
          )}
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
    position: 'relative'
  },

  

  diaryPage: {
    width: '600px',
    height: '800px',
    background: '#fff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px #e5e5e5',
    position: 'relative',
    padding: '60px 40px 40px 80px',
    marginLeft: '1rem',
    overflow: 'hidden'
  },

  marginLine: {
    position: 'absolute',
    left: '2.5rem',
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

  savedIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#e8f5e8',
    color: '#4a7c59',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px'
  },

  checkIcon: {
    width: '12px',
    height: '12px'
  },

  titleSection: {
    marginBottom: '20px',
    position: 'relative',
    zIndex: 1
  },

  titleInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '22px',
    fontFamily: 'inherit',
    color: '#2c3e50',
    fontWeight: '600',
    lineHeight: '32px',
    padding: '0',
    borderRadius: '0'
  },

  shareSection: {
    position: 'relative',
    zIndex: 1,
    marginBottom: '25px'
  },

  visibilitySelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    background: '#f8f9fa',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
    width: 'fit-content',
    fontSize: '14px'
  },

  visibilityGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  visibilityLabel: {
    color: '#495057',
    fontWeight: '500'
  },

  visibilitySelect: {
    border: '1px solid #ced4da',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '14px',
    background: '#fff'
  },

  anonymousGroup: {
    display: 'flex',
    alignItems: 'center'
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    color: '#495057'
  },

  checkbox: {
    margin: '0'
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
    paddingTop:'10px',
    position: 'relative',
    zIndex: 1,
    marginBottom: '30px',
    height: '400px',
    overflow: 'hidden'
  },

  contentTextarea: {
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    resize: 'none',
    background: 'transparent',
    fontSize: '16px',
    fontFamily: 'inherit',
    color: '#2c3e50',
    lineHeight: '32px',
    padding: '0',
    overflow: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#ccc transparent'
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
    border: '1px solid #ddd',
    '&:nth-child(1)': { top: '0', left: '0' },
    '&:nth-child(2)': { top: '0', right: '0' },
    '&:nth-child(3)': { bottom: '0', left: '0' },
    '&:nth-child(4)': { bottom: '0', right: '0' }
  },

  removeImageButton: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: '#ff4757',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },

  trashIcon: {
    width: '12px',
    height: '12px'
  },

  statsSection: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'right',
    marginTop: 'auto'
  },

  statsText: {
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic'
  },

  limitWarning: {
    fontWeight: 'bold'
  },

  heightLimitWarning: {
    fontWeight: 'bold',
    color: '#ff6b6b'
  }
};

export default JournalForm;