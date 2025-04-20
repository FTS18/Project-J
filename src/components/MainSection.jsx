import React from 'react';
import Slider from './Slider';
import Form from './Form';
import CommentBox from './CommentBox';
import FAQ from './FAQ';

const MainSection = () => {
    return (
        <section className="main" id="main">
            <Slider />
            <Form />
            <CommentBox />
            <FAQ />
        </section>
    );
};

export default MainSection;