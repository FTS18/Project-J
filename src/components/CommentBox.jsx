import React, { useState, useEffect } from "react";

const apiUrl =
  "https://script.google.com/macros/s/AKfycbwJlQ2f7hiFFoCxjKWJxgbrq4pt0822r5Iteqi5tOXFryvcLgN7BfXYeFOlJji08ap6FA/exec";

const CommentBox = () => {
  const [username, setUsername] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [usernameColors, setUsernameColors] = useState({});

  useEffect(() => {
    loadComments();
  }, []);

  const generateColor = (name) => {
    if (usernameColors[name]) return usernameColors[name];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    let r = ((hash & 0xff) % 106) + 160;
    let g = (((hash >> 8) & 0xff) % 160) + 95;
    let b = (((hash >> 16) & 0xff) % 186) + 60;
    r = (r + ((hash >> 40) & 0x1f) * 3) % 256;
    g = (g + ((hash >> 20) & 0x1f) * 3) % 256;
    b = (b + ((hash >> 24) & 0x1f) * 3) % 256;
    const color = `rgb(${r}, ${g}, ${b})`;
    setUsernameColors((prev) => ({ ...prev, [name]: color }));
    return color;
  };

  const getHashedUsername = async () => {
    const response = await fetch("https://api64.ipify.org?format=json");
    const data = await response.json();
    const hash = data.ip.split(".").reduce((a, b) => a + parseInt(b), 0);
    const words = [
      "Shadow",
      "Pixel",
      "Cyber",
      "Neon",
      "Ghost",
      "Blue",
      "Ninja",
      "Rogue",
      "Echo",
      "Solar",
      "Quantum",
      "Mystic",
      "Omega",
      "Hyper",
      "Inferno",
      "Stealth",
      "Cosmic",
      "Nova",
      "Zenith",
      "Warp",
    ];
    const animals = [
      "Wolf",
      "Tiger",
      "Falcon",
      "Dragon",
      "Phoenix",
      "Panther",
      "Raven",
      "Viper",
      "Lynx",
      "Cobra",
      "Hawk",
      "Jaguar",
      "Griffin",
      "Cheetah",
      "Leopard",
      "Eagle",
      "Fox",
      "Scorpion",
      "Bear",
      "Kraken",
    ];
    const randomWord = words[hash % words.length];
    const randomAnimal = animals[hash % animals.length];
    const randomNumber = (hash % 900) + 100;
    return `${randomWord}${randomAnimal}${randomNumber}`;
  };

  const loadComments = async () => {
    const response = await fetch(apiUrl);
    const data = await response.json();
    setComments(data);
  };

  const addComment = async () => {
    if (!comment.trim()) {
      alert("Please enter a comment!");
      return;
    }
    const name = username.trim() || (await getHashedUsername());
    await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({ username: name, comment }),
    });
    setComment("");
    loadComments();
    if (!commentsVisible) setCommentsVisible(true);
  };

  return (
    <div className="comment-box">
      <h2>Comments</h2>
      <div className="comments">
        <div className="comment-wrapper">
          <input
            className="inpc"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name (optional)"
          />
          <textarea
            className="inpc tta"
            rows="10"
            cols="50"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts"
            style={{ resize: "none" }}
          />
          <button className="cbutton" onClick={addComment}>
            Post
          </button>
          <button
            className="cbutton"
            onClick={() => setCommentsVisible((prev) => !prev)}
          >
            {commentsVisible ? "Hide" : "View"}
          </button>
          <div
            id="comments"
            className={commentsVisible ? "show-comments" : "hide-comments"}
          >
            {comments.map((c, i) => {
              const color = generateColor(c.username);
              return (
                <p key={i}>
                  <b style={{ color }}>{c.username}</b>: {c.comment}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentBox;
