import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import MainSection from './components/MainSection';
import Footer from './components/Footer';
import Explore from './Explore';
import './assets/css/style.css';
import './assets/css/theme.css';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, runTransaction } from 'firebase/database'; // Corrected import

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDc1TevGso9fI3sBSEaqE5_WqsBGA-_zXk",
    authDomain: "views-4576f.firebaseapp.com",
    databaseURL: "https://views-4576f-default-rtdb.firebaseio.com",
    projectId: "views-4576f",
    storageBucket: "views-4576f.firebasestorage.app",
    messagingSenderId: "666092567983",
    appId: "1:666092567983:web:c868e1973002f7bcb6435a"
};

const App = () => {
    const [projectViews, setProjectViews] = useState(0);
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    useEffect(() => {
        let isMounted = true;

        const getViewerIp = () => {
            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => {
                    if (isMounted) {
                        countView(data.ip);
                    }
                })
                .catch(error => console.error('Error fetching IP:', error));
        };

        const countView = (viewerIp) => {
            const ipToString = viewerIp.toString().replace(/\./g, '-');
            const dbRef = ref(database, `viewers/${ipToString}`);

            onValue(dbRef, (snapshot) => {
                if (!snapshot.exists() && isMounted) {
                    set(dbRef, true);

                    const projectRef = ref(database, 'project_clicks/ProjectJ');
                    runTransaction(projectRef, (currentViews) => {
                        return (currentViews || 0) + 1;
                    });
                }
            });
        };

        getViewerIp();

        const projectViewsRef = ref(database, 'project_clicks/ProjectJ');
        const unsubscribe = onValue(projectViewsRef, (snapshot) => {
            if (isMounted) {
                setProjectViews(snapshot.val() || 0);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    return (
        <Router>
            <div>
                <Navigation />
                <Routes>
                    <Route path="/" element={<MainSection />} />
                    <Route path="/explore" element={<Explore />} />
                </Routes>
                <Footer />
                <div id="vcc">
                    <p id="vct">Views: {projectViews}</p>
                </div>
            </div>
        </Router>
    );
};

export default App;