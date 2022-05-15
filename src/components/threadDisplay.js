import React, { useState, useEffect, useRef } from 'react';
import ReadingProgressBar from './readingProgressBar';
import LimitedViewingBanner from './limitedViewingBanner';
import {decode} from 'html-entities';

const readingTime = require('reading-time/lib/reading-time');

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

        return decodedText;
    }

    render () {
        let loader = this.state.loading ? "loading..." : ""

        let thread = null;
        let author = null;

        let raw = null;
        let reading_time = null;

        if (this.state.loading == false && this.state.data) {
            author = this.state.data.author;

            thread = this.state.data.tweets.map(tweet => {
                raw = raw + tweet.text; //used to keep track of whole text -> readingTime calculation //TODO: Organize code

                return (
                    <p key={tweet.id}>
                        {this.formatText(tweet.text)}
                        {tweet.medias &&
                            tweet.medias.map(media =>{
                                return <img key={media.media_key} className="thread_img" src={media.url} />
                            })
                        }
                    </p>
                )
            })

            reading_time = readingTime(raw);
        }

        const target = React.createRef();

        return(
            <>
                <div>
                    {loader}
                </div>

                {author &&
                    <div className="storyHeader">
                        <div className="author">
                            Written by <a href={author.url} target="_blank">{author.name}</a>
                        </div>

                        <div className="readingTime">
                            {reading_time.text}
                        </div>
                    </div>
                }

                <div className="thread" ref={target}>
                    {thread ? thread : null}
                </div>

                <ReadingProgressBar target={target} />
            </>
        )
    }
}

export default ThreadDisplay;