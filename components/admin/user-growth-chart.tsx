export function UserGrowthChart() {
  return (
    <div className="chart-box" aria-label="User growth chart">
      <svg viewBox="0 0 760 248" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M28 170 C98 148, 138 158, 198 132 S292 92, 360 112 S475 72, 548 86 S660 58, 732 46"
          fill="none"
          stroke="#1bae8c"
          strokeLinecap="round"
          strokeWidth="6"
        />
        <path
          d="M28 170 C98 148, 138 158, 198 132 S292 92, 360 112 S475 72, 548 86 S660 58, 732 46 L732 248 L28 248 Z"
          fill="rgba(27,174,140,.13)"
        />
      </svg>
    </div>
  );
}
