import React from 'react';

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
  const isSmallScreen = window.innerWidth <= 480;

  return (
    <div style={styles.actionButtons}>
      <button
        onClick={onSave}
        disabled={!title.trim() || !content.trim() || isLoading}
        style={{
          ...styles.baseButton,
          ...styles.saveButton,
          ...(title && content && !isLoading
            ? styles.saveButtonEnabled
            : styles.saveButtonDisabled),
          ...(isSmallScreen && styles.smallScreenButton)
        }}
      >
        <span style={styles.buttonIcon}>💾</span>
        <span style={styles.buttonText}>
          {isSaved ? 'Saved!' : isLoading ? 'Saving...' : isEditing ? 'Update' : 'Save'}
        </span>
      </button>

      {isEditing && (
        <button
          onClick={onCancelEdit}
          style={{
            ...styles.baseButton,
            ...styles.cancelButton,
            ...(isSmallScreen && styles.smallScreenButton)
          }}
        >
          <span style={styles.buttonIcon}>❌</span>
          <span style={styles.buttonText}>Cancel</span>
        </button>
      )}

      <label
        style={{
          ...styles.baseButton,
          ...styles.photoButton,
          ...(isSmallScreen && styles.smallScreenButton)
        }}
      >
        <span style={styles.buttonIcon}>📸</span>
        <span style={styles.buttonText}>Photo</span>
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
    gap: '10px',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
    background: '#f8f8f8',
    borderTop: '1.5px dashed #ccc',
    fontFamily: '"Kalam", "Comic Sans MS", cursive',
    flexWrap: 'wrap'
  },

  baseButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontFamily: 'inherit',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textShadow: '0 1px 1px rgba(0,0,0,0.1)',
    justifyContent: 'center',
    minWidth: '100px',
    position: 'relative',
    overflow: 'hidden'
  },

  smallScreenButton: {
    padding: '8px 12px',
    fontSize: '12px',
    minWidth: '90px'
  },

  saveButton: {
    background: 'linear-gradient(135deg, #6fa573 0%, #4a7c59 100%)',
    border: '1.5px solid #4a7c59',
    color: '#fff'
  },

  saveButtonEnabled: {
    opacity: 1,
  },

  saveButtonDisabled: {
    background: '#bbb',
    border: '1.5px solid #999',
    color: '#eee',
    cursor: 'not-allowed',
    opacity: 0.6
  },

  cancelButton: {
    background: 'linear-gradient(135deg, #ee5a6f 0%, #c44569 100%)',
    border: '1.5px solid #c44569',
    color: '#fff'
  },

  photoButton: {
    background: 'linear-gradient(135deg, #4b7bec 0%, #3867d6 100%)',
    border: '1.5px solid #3867d6',
    color: '#fff'
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
    fontSize: '16px',
    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'
  },

  buttonText: {
    whiteSpace: 'nowrap'
  }
};

export default ActionButtons;
