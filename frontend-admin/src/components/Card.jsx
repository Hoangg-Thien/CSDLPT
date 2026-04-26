import "../css/Card.css";

export default function Card({ title, children, right }) {
  return (
    <div className="card">
      
      {(title || right) && (
        <div className="card-header">
          <span>{title}</span>
          <div>{right}</div>
        </div>
      )}

      <div className="card-body">
        {children}
      </div>

    </div>
  );
}