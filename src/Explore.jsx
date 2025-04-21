import React, { useEffect, useState } from 'react';
import './assets/css/theme.css';
import './assets/css/explore.css'; 
import './assets/css/style.css';// Import the combined CSS
import examsData from './exams.json'; // Import the JSON data
import ExamCard from './components/ExamCard'; // Import the ExamCard component

const Explore = () => {
  const [expandedInfo, setExpandedInfo] = useState({});

  const toggleInfo = (index) => {
    setExpandedInfo(prevState => ({
      ...prevState,
      [index]: !prevState[index]
    }));
  };

  return (
    <section className="main" id="main">
      <section className="slider">
        <div className="container3">
          <svg
            className="border shadow-md dark:border-slate-700"
            viewBox="0 0 844.8 475.2"
            style={{ width: '100%', height: '350px' }}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <rect className="bg" id="bg" x="0" y="0" width="844.8" height="475.2" fill="#ffffff"></rect>
            <defs>
              <filter id="f1" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="113"></feGaussianBlur>
              </filter>
            </defs>
            <circle cx="844.7356664340596" cy="244.97189647910855" r="422.4" fill="#5a09ff" filter="url(#f1)"></circle>
            <circle cx="545.897808074884" cy="641.5431289187861" r="422.4" fill="#00a8c9" filter="url(#f1)"></circle>
            <circle cx="76.39017649232983" cy="479.87868671468175" r="422.4" fill="#2B0313" filter="url(#f1)"></circle>
            <circle cx="85.05636055602349" cy="-16.606665779425214" r="422.4" fill="#00ff44" filter="url(#f1)"></circle>
            <circle cx="559.9199884427028" cy="-161.7870463331515" r="422.4" fill="#49ac9f" filter="url(#f1)"></circle>
          </svg>
        </div>
        <div className="main-title" style={{ marginTop: "42px" }}>EXPLORE</div>
      </section>

      <section className="area1">
        <div className="form timers">
          {examsData.map((exam, index) => (
            <ExamCard
              key={index}
              exam={exam}
              index={index}
              expandedInfo={expandedInfo}
              toggleInfo={toggleInfo}
            />
          ))}
        </div>
      </section>
    </section>
  );
};

export default Explore;