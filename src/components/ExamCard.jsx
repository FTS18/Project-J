import React, { useEffect, useState } from 'react';

const ExamCard = ({ exam, index, expandedInfo, toggleInfo }) => {
  const [timeLeft, setTimeLeft] = useState('Loading...');
  const isMobile = window.innerWidth <= 768; // Basic check for mobile styles

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      let target;
      let status = '';

      if (exam.date.includes('to')) {
        const [startDateStr, endDateStr] = exam.date.split(' to ');
        const startDate = new Date(startDateStr).getTime();
        const endDate = new Date(endDateStr).getTime();

        if (now >= startDate && now <= endDate) {
          status = 'Ongoing';
          target = endDate;
        } else if (now < startDate) {
          target = startDate;
        } else {
          status = 'Ended';
        }
      } else {
        target = new Date(exam.date).getTime();
        if (now > target) {
          status = 'Ended';
        } else if (now === target) {
          status = 'Ongoing';
        }
      }

      const diff = target - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (status === 'Ended') {
        setTimeLeft('Ended');
      } else if (status === 'Ongoing') {
        setTimeLeft('Ongoing');
      } else if (diff <= 7 * 24 * 60 * 60 * 1000) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${days} days left`);
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [exam.date]);

  const iconName = expandedInfo[index] ? 'keyboard_arrow_up' : 'keyboard_arrow_down';

  return (    
    <div className="timer-box"
      style={{ borderLeft: `5px solid ${exam.color}` }}>
      <div className="exam-header" style={isMobile ? undefined : {}}> {/* Conditional inline style */}
        <div className="exam-info" style={isMobile ? undefined : {}}> {/* Conditional inline style */}
          <img src={`res/${exam.logo}`} alt={exam.name} style={isMobile ? undefined : {}} /> {/* Conditional inline style */}
          <div>
            <div className="exam-name" style={isMobile ? undefined : {}}>{exam.name}</div>
            <div className="timer" style={isMobile ? undefined : {}} id={`timer${index}`}>{timeLeft}</div>
          </div>
        </div>
      </div>
      <div className="btnGang" style={isMobile ? undefined : {}}> {/* Conditional inline style */}
        <a
          href={exam.link}
          className="visitBtn"
          style={{ color: 'white', background: exam.color }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit
        </a>
        <a href="#" className="dummyBtn" onClick={(e) => e.preventDefault()} style={isMobile ? undefined : {}}>
          {exam.fees}
        </a>
        <a className="moreBtn" onClick={() => toggleInfo(index)} style={isMobile ? undefined : {}}>
          <span className="material-icons">{iconName}</span>
        </a>
      </div>
      <div className={`more-info ${expandedInfo[index] ? 'expanded' : ''}`} id={`info${index}`} style={isMobile ? undefined : {}}> {/* Conditional inline style */}
        {exam.info.split('\n').map((item, key) => (
          <span key={key}>{item}<br /></span>
        ))}
      </div>
    </div>
  );
};

export default ExamCard;