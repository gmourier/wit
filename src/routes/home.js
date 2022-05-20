import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="onboarder">
            <h2>The inspiring stories are already around.</h2>
            <p>
                It's all about content. Wit is designed to guide doers through inspiring short stories that resonates.
            </p>

            <h2>Leaving the story to be told.</h2>
            <p>
                Far from the surrounding noise of our society, this space is made for concentration and peace of mind. Wit helps you capture the essence.
            </p>

            <h2>A reading partner.</h2>
            <p>
                It's ok to feel overwhelm. If you don't know where to start among all your saved stories, Wit can help you take the first step. All you have to do is ask him.
            </p>

            <h2>Shall we continue?</h2>
            <p>
                <Link to="/thread/1524807290888499200">Let's read a story.</Link>
            </p>
        </div>
    )
};

export default Home;