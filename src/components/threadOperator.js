import React from 'react';

import ThreadDisplay from '../components/threadDisplay';

class ThreadOperator extends React.Component {
    constructor(props) {
        super(props);
    }

    render () {
        return (
            <>
                <ThreadDisplay tweetId={this.props.tweetId}/>
            </>
        )
    }
}

export default ThreadOperator;