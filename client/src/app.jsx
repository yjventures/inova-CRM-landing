import React from "react";
import Routes from "./Routes";

function App() {
  return (
    <>
      <div style={{position:'fixed', top: 8, right: 8, padding: '4px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: 6, fontSize: 12, zIndex: 9999}}>App mounted</div>
      <Routes />
    </>
  );
}

export default App;
