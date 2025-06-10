

const VisibilitySelector = ({
  visibility,
  isAnonymous,
  visibilityOptions,
  onVisibilityChange,
  onIsAnonymousChange
}) => {
  return (
    <div className="sharing-controls">
      <div className="share-section">
        <label className="share-label">Share to</label>
        <div className="visibility-dropdown">
          {visibilityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onVisibilityChange(option.value);
                console.log(`Visibility changed to: ${option.value}`);
              }}
              className={`visibility-option ${visibility === option.value ? 'selected' : ''}`}
              title={option.description}
            >
              <span className="visibility-icon">{option.icon}</span>
              <span className="visibility-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Anonymous Toggle - Only show when not private */}
      {(visibility === 'close-circle' || visibility === 'everyone') && (
        <div className="anonymous-section">
          <label className="anonymous-toggle">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => onIsAnonymousChange(e.target.checked)}
              className="anonymous-checkbox"
            />
            <span className="anonymous-slider"></span>
            <span className="anonymous-label">
              👤 Hide my identity
            </span>
          </label>
          {isAnonymous && (
            <div className="anonymous-hint">
              Your name won't be shown with this post
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisibilitySelector;