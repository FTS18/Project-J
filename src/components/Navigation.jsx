import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation

const Navigation = () => {
  const location = useLocation(); // Get the current location

  return (
    <div className="nav">
      <div className="navcontent">
        <a
          href="https://ananay.netlify.app"
          style={{ fontStyle: 'italic', textDecoration: 'none', color: 'white', border: 'none' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Project J
        </a>
        {location.pathname === '/' ? (
          <Link className="button" to="/explore">
            <svg className="svgIcon" viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path>
            </svg>
            More
          </Link>
        ) : (
          <Link className="button" to="/">
            <svg className="svgIcon" viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9s-17.6-3.5-24-9.9c-12.8-12.8-12.8-33.5 0-46.3l105.1-105.1H112c-8.8 0-16-7.2-16-16s7.2-16 16-16h186.9l-105.1-105.1c-12.8-12.8-12.8-33.5 0-46.3 12.8-12.8 33.5-12.8 46.3 0z"></path>
            </svg>
            Back
          </Link>
        )}
        {/* <button id="darkModeToggle">Dark Mode</button> */}
      </div>
    </div>
  );
};

export default Navigation;