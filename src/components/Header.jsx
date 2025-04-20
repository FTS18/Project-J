import React from 'react';

const Header = () => {
    return (
        <header>
            <a className="button1" href="#main">
                <svg className="svgIcon1" viewBox="0 0 384 512">
                    <path
                        d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z">
                    </path>
                </svg>
            </a>

            <div className="nav">
                <div className="navcontent">
                    <a href="https://ananay.netlify.app" style={{ fontStyle: 'italic', textDecoration: 'none', color: 'white', border: 'none' }}>
                        Project J
                    </a>
                    <a className="button" href="/explore.html">
                        <svg className="svgIcon" viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z">
                            </path>
                        </svg>
                        More
                    </a>
                    {/* <button id="darkModeToggle">Dark Mode</button> */}
                </div>
            </div>
        </header>
    );
};

export default Header;