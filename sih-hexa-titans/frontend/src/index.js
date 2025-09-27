    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App';

    // Get the element where the app will be displayed (defined in public/index.html)
    const root = ReactDOM.createRoot(document.getElementById('root'));
    
    // Render the App component
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
