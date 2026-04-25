import { useState } from "react";
import "../css/Toggle.css";

export default function Toggle({ defaultOn = false, onChange }) {
  const [on, setOn] = useState(defaultOn);

  const handleToggle = () => {
    const newState = !on;
    setOn(newState);
    onChange && onChange(newState);
  };

  return (
    <div className="toggle-wrap" onClick={handleToggle}>
      
      <div className={`toggle ${on ? "on" : ""}`}>
        <div className="toggle-dot"></div>
      </div>

      <span className={on ? "on-text" : "off-text"}>
        {on ? "ON" : "OFF"}
      </span>

    </div>
  );
}