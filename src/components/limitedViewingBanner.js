import React from 'react';

const LimitedViewingBanner = (props) => {
    return (
        <div className={`limited-viewing-banner`}>
            The thread is over 7 days old. Unfortunately, Twitter does not allow us to display {props.authorName}'s story.
        </div>
    );
};

export default LimitedViewingBanner;