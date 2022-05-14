import React, { useState, useEffect, useRef } from 'react';
import ReadingProgressBar from './readingProgressBar';
import LimitedViewingBanner from './limitedViewingBanner';

import {decode} from 'html-entities';

class ThreadDisplay extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            data: null
        }
    }

    getThread(tweetId) {
        return new Promise((resolve, reject) => {
          fetch("https://req.wit-app.workers.dev/?tweetId=" + tweetId)
            .then((data) => data.json())
            .then((resp) => resolve(resp))
            .catch((err) => reject(err));
        });
    }

    formatText(text) {
        let decodedText = decode(text);

        if (!isNaN(decodedText.charAt(0))){
            //first char is a number; Extract sentence and make it shine as a title.
            const after  = decodedText.slice(decodedText.indexOf('\n') + 1);
            const before = decodedText.slice(0, decodedText.indexOf('\n'));

            return (
                <>
                    <h2>{before}</h2>
                    {after}
                </>
            );
        }


        return (
           decodedText
        );
    }

    componentDidMount() {
        if (this.props.tweetId) {
            this.setState({loading: true})
            this.getThread(this.props.tweetId).then((data) => {
                this.setState({
                    loading: false,
                    data: data
                })
            });
        }
    }


    render () {
        let text = this.state.loading ? "loading..." : ""

        let thread_parts = null;
        let author = null;

        if (this.state.loading == false && this.state.data) {
            author = this.state.data.author;
            thread_parts = this.state.data.tweets.map(tweet =>
                <p key={tweet.id}>
                    {this.formatText(tweet.text)}
                    {tweet.media &&
                        <img className="thread_img" src={tweet.media.url} />
                    }
                </p>
            )
        }

        const target = React.createRef();

        return(
            <>
                <div>
                    {text}
                </div>

                {author &&
                    <div className="authorBanner">
                        A story written by <a href={author.url} target="_blank">{author.name}</a>
                    </div>
                }

                {/* {author &&
                    <LimitedViewingBanner authorName={author.name}/>
                } */}

                <div className="thread" ref={target}>
                    {thread_parts ? thread_parts : null}
                </div>

                <ReadingProgressBar target={target} />
            </>
        )
    }
}

export default ThreadDisplay;