const bars = ["42%", "58%", "50%", "74%", "63%", "86%", "69%"];

export function ActivityBars() {
  return (
    <div className="chart-box compact" aria-label="Activity logs chart">
      <div className="bars">
        {bars.map((height, index) => (
          <span className="bar" key={`${height}-${index}`} style={{ height }} />
        ))}
      </div>
    </div>
  );
}
