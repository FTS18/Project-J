import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import routing components
import Navigation from './components/Navigation';
import MainSection from './components/MainSection';
import Footer from './components/Footer';
import Explore from './Explore'; // Import your new Explore component
import './assets/css/style.css';
import './assets/css/theme.css';
import { database, ref, onValue } from './firebase';

const App = () => {
    const [projectViews, setProjectViews] = useState(0);

    useEffect(() => {
        const projectRef = ref(database, 'project_clicks/ProjectJ');

        onValue(projectRef, (snapshot) => {
            const views = snapshot.val() || 0;
            setProjectViews(views);
        });

        return () => {
            // Cleanup logic if needed
        };
    }, []);

    return (
        <Router>
            <div>
                <Navigation />
                <Routes>
                    {/* Route for the main page (/) */}
                    <Route path="/" element={<MainSection />} />

                    {/* Route for the explore page (/explore) */}
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