import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import MainSection from './components/MainSection';
import Footer from './components/Footer';
import './assets/css/style.css';
import './assets/css/theme.css';
import { database, ref, onValue } from './firebase'; // Import necessary Firebase functions

const App = () => {
    const [projectViews, setProjectViews] = useState(0);

    // Get and display the view count
    useEffect(() => {
        const projectRef = ref(database, 'project_clicks/ProjectJ'); // Get a reference to your database path

        // Listen for changes to the view count
        onValue(projectRef, (snapshot) => {
            const views = snapshot.val() || 0; // Get the view count or default to 0 if undefined
            setProjectViews(views);
        });

        return () => {
            // Cleanup logic here if needed
        };
    }, []);

    return (
        <div>
            <Navigation />
            <MainSection />
            <Footer />

            {/* Display the view count in the specified structure */}
            <div id="vcc">
                <p id="vct">Views: {projectViews}</p>
            </div>
        </div>
    );
};

export default App;
