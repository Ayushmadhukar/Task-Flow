const ProgressBar = ({ value, showLabel = true, color = 'primary' }) => (
  <div className="progress-bar-wrapper">
    <div className={`progress-bar progress-bar--${color}`}>
      <div
        className="progress-bar-fill"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
    {showLabel && <span className="progress-label">{value}%</span>}
  </div>
);

export default ProgressBar;
