import React, { useEffect, useState } from 'react';

const FAQ = () => {
    const [faqs, setFaqs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadFAQs = async () => {
            try {
                const response = await fetch('faq.json');
                if (!response.ok) {
                    throw new Error('Failed to load FAQs');
                }
                const data = await response.json();
                setFaqs(data);
            } catch (err) {
                setError(err.message);
            }
        };

        loadFAQs();
    }, []);

    return (
        <div className="faq-container">
            <h2>FAQs</h2>
            {error && <p>{error}</p>}
            <div id="faq-list">
                {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                        <button className="faq-question" onClick={() => {
                            const answerDiv = document.getElementById(`answer-${index}`);
                            answerDiv.style.display = answerDiv.style.display === 'block' ? 'none' : 'block';
                        }}>
                            {faq.question}
                        </button>
                        <div id={`answer-${index}`} className="faq-answer" style={{ display: 'none' }}>
                            <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;