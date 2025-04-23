import React, { useEffect, useState } from 'react';

const FAQ = () => {
    const [faqs, setFaqs] = useState([]);
    const [error, setError] = useState(null);
    const [expandedIndex, setExpandedIndex] = useState(null);

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

    const handleQuestionClick = (index) => {
        if (expandedIndex === index) {
            // If the clicked FAQ is already expanded, collapse it
            setExpandedIndex(null);
        } else {
            // Otherwise, expand the clicked FAQ and collapse any previously expanded one
            setExpandedIndex(index);
        }
    };

    return (
        <div className="faq-container">
            <h2>FAQs</h2>
            {error && <p>{error}</p>}
            <div id="faq-list">
                {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                        <button
                            className="faq-question"
                            onClick={() => handleQuestionClick(index)}
                        >
                            {faq.question}
                        </button>
                        <div
                            id={`answer-${index}`}
                            className="faq-answer"
                            style={{ display: expandedIndex === index ? 'block' : 'none' }}
                        >
                            <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;