import { useState, useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
