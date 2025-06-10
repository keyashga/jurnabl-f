

const ActionButtons = ({
  title,
  content,
  isLoading,
  isSaved,
  isEditing,
  onSave,
  onCancelEdit,
  onImageChange
}) => {
  return (
    <div style={styles.actionButtons}>
      <button
        onClick={onSave}
        disabled={!title.trim() || !content.trim() || isLoading}
        style={{
          ...styles.saveButton,
          ...(title && content ? styles.saveButtonEnabled : styles.saveButtonDisabled)
        }}
      >
        <span style={styles.buttonIcon}>💾</span>
        <span style={styles.buttonText}>
          {isSaved ? 'Saved!' : isLoading ? 'Saving...' : isEditing ? 'Update Journal' : 'Save Entry'}
        </span>
      </button>

      {isEditing && (
        <button onClick={onCancelEdit} style={styles.cancelButton}>
          <span style={styles.buttonIcon}>❌</span>
          <span style={styles.buttonText}>Cancel Edit</span>
        </button>
      )}

      <label style={styles.photoButton}>
        <span style={styles.buttonIcon}>📸</span>
        <span style={styles.buttonText}>Add Photo</span>
        <input
          type="file"
          style={styles.photoInput}
          accept="image/*"
          onChange={onImageChange}
        />
      </label>
    </div>
  );
};

const styles = {
  actionButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    background: '#f8f4f0',
    borderTop: '2px dashed #d4c5b9',
    fontFamily: '"Kalam", "Comic Sans MS", cursive',
    flexWrap: 'wrap'
  },

  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    border: '2px solid #4a7c59',
    borderRadius: '25px',
    background: 'linear-gradient(135deg, #6fa573 0%, #4a7c59 100%)',
    color: '#fff',
    fontSize: '16px',
    fontFamily: 'inherit',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(74, 124, 89, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
    position: 'relative',
    overflow: 'hidden',
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    minWidth: '140px',
    justifyContent: 'center'
  },

  saveButtonEnabled: {
    transform: 'translateY(0)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(74, 124, 89, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
      background: 'linear-gradient(135deg, #7fb583 0%, #5a8c69 100%)'
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 10px rgba(74, 124, 89, 0.3), inset 0 2px 4px rgba(0,0,0,0.1)'
    }
  },

  saveButtonDisabled: {
    background: 'linear-gradient(135deg, #bbb 0%, #999 100%)',
    border: '2px solid #999',
    cursor: 'not-allowed',
    opacity: 0.6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    color: '#ddd'
  },

  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    border: '2px solid #c44569',
    borderRadius: '25px',
    background: 'linear-gradient(135deg, #ee5a6f 0%, #c44569 100%)',
    color: '#fff',
    fontSize: '16px',
    fontFamily: 'inherit',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(196, 69, 105, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    minWidth: '120px',
    justifyContent: 'center',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(196, 69, 105, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
      background: 'linear-gradient(135deg, #f86a7f 0%, #d45579 100%)'
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 10px rgba(196, 69, 105, 0.3), inset 0 2px 4px rgba(0,0,0,0.1)'
    }
  },

  photoButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    border: '2px solid #3867d6',
    borderRadius: '25px',
    background: 'linear-gradient(135deg, #4b7bec 0%, #3867d6 100%)',
    color: '#fff',
    fontSize: '16px',
    fontFamily: 'inherit',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(56, 103, 214, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    minWidth: '120px',
    justifyContent: 'center',
    position: 'relative',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(56, 103, 214, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
      background: 'linear-gradient(135deg, #5b85fc 0%, #4877e6 100%)'
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 10px rgba(56, 103, 214, 0.3), inset 0 2px 4px rgba(0,0,0,0.1)'
    }
  },

  photoInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    left: 0,
    top: 0
  },

  buttonIcon: {
    fontSize: '18px',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
  },

  buttonText: {
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap'
  }
};

export default ActionButtons;