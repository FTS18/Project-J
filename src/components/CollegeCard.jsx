import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { getDatabase, ref, onValue, set, update, increment, get } from 'firebase/database';
import { getApp } from 'firebase/app'; // Import getApp

const CollegeCard = ({ college, probability, saveCount: propSaveCount, onSaveChange }) => {
  const [isSavedByUser, setIsSavedByUser] = useState(false);
  const [viewerIp, setViewerIp] = useState(null);
  const [currentSaveCount, setCurrentSaveCount] = useState(propSaveCount);

  const collegeName = useMemo(() => {
    return (college.institute?.trim() || "Unnamed College")
      .replace(/Indian Institute of Technology/g, "IIT")
      .replace(/National Institute of Technology/g, "NIT")
      .replace(/Indian Institute of Information Technology/g, "IIIT");
  }, [college.institute]);

  const googleSearchUrl = useMemo(() => {
    return `https://www.google.com/search?q=${encodeURIComponent(
      collegeName + " college pravesh"
    )}`;
  }, [collegeName]);

  const isHS = useMemo(() => college.quota?.trim().toLowerCase() === "hs", [college.quota]);
  const collegeType = useMemo(() => college.type?.toUpperCase() || "", [college.type]);
  const probabilityClass = useMemo(() => {
    if (probability === "Medium") return "med";
    if (probability === "High") return "hh";
    if (probability === "Low") return "lw";
    return "";
  }, [probability]);

  const app = getApp();
  const database = getDatabase(app);
  const sanitizePath = useCallback((name) => {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_');
  }, []);

  const sanitizedCollegeName = useMemo(() => sanitizePath(collegeName), [collegeName, sanitizePath]);

  const collegeSavesRef = useMemo(() => {
    return ref(database, `colleges/${sanitizedCollegeName}/uniqueSavesCount`);
  }, [database, sanitizedCollegeName]);

  const userSavesRef = useCallback((ip) => {
    return ref(database, `colleges/${sanitizedCollegeName}/savedBy/${ip?.replace(/\./g, '-')}`);
  }, [database, sanitizedCollegeName]);

  useEffect(() => {
    let isMounted = true;
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        if (isMounted && data?.ip) {
          setViewerIp(data.ip);
        }
      } catch (error) {
        console.error('Error fetching IP:', error);
      }
    };
    fetchIp();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setCurrentSaveCount(propSaveCount);
  }, [propSaveCount]);

  useEffect(() => {
    if (viewerIp) {
      const userSaveRef = ref(database, `colleges/${sanitizedCollegeName}/savedBy/${viewerIp?.replace(/\./g, '-')}`);
      onValue(userSaveRef, (snapshot) => {
        setIsSavedByUser(snapshot.exists());
      });
    }
  }, [database, sanitizedCollegeName, viewerIp]);

  useEffect(() => {
    onValue(collegeSavesRef, (snapshot) => {
      const value = snapshot.val();
      setCurrentSaveCount(value || 0);
    });
  }, [collegeSavesRef]);

  const handleCardClick = useCallback(() => {
    window.open(googleSearchUrl, "_blank");
  }, [googleSearchUrl]);

  const handleSaveClick = useCallback((event) => {
    event.stopPropagation();
    if (!viewerIp) {
      console.log('Could not identify user IP.');
      return;
    }

    const userSaveRef = userSavesRef(viewerIp);

    get(userSaveRef)
      .then(snapshot => {
        if (snapshot.exists()) {
          // User has already saved, handle unsave
          set(userSaveRef, null)
            .then(() => {
              update(collegeSavesRef, increment(-1));
              if (onSaveChange) {
                onSaveChange(sanitizedCollegeName, Math.max(0, currentSaveCount - 1));
              }
            })
            .catch((error) => {
              console.error("Error unsaving college:", error);
            });
        } else {
          // User hasn't saved yet, handle save
          set(userSaveRef, true)
            .then(async () => {
              const collegeSnapshot = await get(collegeSavesRef);
              if (!collegeSnapshot.exists()) {
                await set(collegeSavesRef, 1);
                if (onSaveChange) {
                  onSaveChange(sanitizedCollegeName, 1);
                }
              } else {
                await update(collegeSavesRef, increment(1));
                if (onSaveChange) {
                  onSaveChange(sanitizedCollegeName, (collegeSnapshot.val() || 0) + 1);
                }
              }
            })
            .catch((error) => {
              console.error("Error saving college:", error);
            });
        }
      })
      .catch(error => {
        console.error("Error checking save status:", error);
      });
  }, [viewerIp, userSavesRef, collegeSavesRef, sanitizedCollegeName, currentSaveCount, onSaveChange]);

  return (
    <div className={`college-card ${isHS ? "hs" : ""} ${collegeType.toLowerCase()}`}>
      <div className="clickable-area" onClick={handleCardClick}>
        <h2 className="college-name">{collegeName}</h2>
        <div className="details">
          <p>{college.branch || "Branch Not Specified"}</p>
          <p>
            {college.category || "Category Not Specified"} |{" "}
            {college.gender || "Gender NotSpecified"} |{" "}
            <span className="quota">
              {college.quota || "Quota Not Specified"}
            </span>
          </p>
          <p>
            <span className="or">OR: {college.openingRank || "N/A"}</span> |{" "}
            <span className="cr">CR: {college.closingRank || "N/A"}</span>
          </p>
          <div>
            {college.city || "City Not Specified"},{" "}
            {college.state || "State Not Specified"}
            {probability && (
              <div className={`probability ${probabilityClass}`}>
                {probability}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="save-container">
        <button
          onClick={handleSaveClick}
          className={`save-button ${isSavedByUser ? 'saved' : ''}`}
          title={isSavedByUser ? "Saved" : "Save"}
          disabled={isSavedByUser}
        >
          <svg viewBox="0 -0.5 25 25" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" d="M18.507 19.853V6.034C18.5116 5.49905 18.3034 4.98422 17.9283 4.60277C17.5532 4.22131 17.042 4.00449 16.507 4H8.50705C7.9721 4.00449 7.46085 4.22131 7.08577 4.60277C6.7107 4.98422 6.50252 5.49905 6.50705 6.034V19.853C6.45951 20.252 6.65541 20.6407 7.00441 20.8399C7.35342 21.039 7.78773 21.0099 8.10705 20.766L11.907 17.485C12.2496 17.1758 12.7705 17.1758 13.113 17.485L16.9071 20.767C17.2265 21.0111 17.6611 21.0402 18.0102 20.8407C18.3593 20.6413 18.5551 20.2522 18.507 19.853Z" clipRule="evenodd" fillRule="evenodd"></path>
          </svg>
        </button>
        <span className="save-counter">{currentSaveCount}</span>
      </div>
    </div>
  );
};

export default CollegeCard;