addEventListener("fetch", (event) => {
    event.respondWith(
        handleRequest(event.request).catch(
            (err) => new Response(err.stack, { status: 500 })
        )
    );
});

async function handleRequest(request) {
    const { searchParams } = new URL(request.url)

    const tweetId = searchParams.get('tweetId');
    if (tweetId === null) {
        return new Response("A tweetId query parameter is missing.", { status: 400 });
    }

    const twitterAPIHeaders = {
        'headers': {
        'Authorization': `Bearer ${BEARER}`
        }
    }
    const responseHeaders = {
        'headers': {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": '*'
        }
    }

    // Fetch the KV store, acting as a distributed cache
    // Cache is made of (tweetId, the previously generated JSON result)
    let result = await WIT_THREADS.get(tweetId);
    if (result === null) {
        // Fetch the first tweet
        const firstTweet = await getTweet(tweetId, twitterAPIHeaders);

        // Fetch sub tweets with a search query (author's answers to himself for a conversation_id)
        const followingTweets = await getFollowingTweets(firstTweet.data[0].author_id, tweetId, twitterAPIHeaders);

        const result = JSON.stringify(formatData(firstTweet, followingTweets));

        await WIT_THREADS.put(tweetId, result);
    }

    return new Response(result, responseHeaders);
}

function formatData(firstTweet, followingTweets) {

    let toFormat = {
    data: [],
    includes: {
        media: [],
        users: []
    }
    };

    //extract and create a structure to iterate on
    if (followingTweets) {
        if (followingTweets.data) {
            toFormat.data = followingTweets.data;
        }

        if (followingTweets.includes) {
            toFormat.includes = followingTweets.includes;
        }
    }

    if (firstTweet) {
        if (firstTweet.data) {
            toFormat.data.push(firstTweet.data[0]);
        }

        if (firstTweet.includes) {
            toFormat.includes.users = firstTweet.includes.users;

            if (firstTweet.includes.media) {
            firstTweet.includes.media.forEach(media => {
                toFormat.includes.media.push(media);
            })
            }
        }
    }

    let author = (toFormat.includes.users.length) ? toFormat.includes.users[0] : null;
    let tweets = [];

    // Iterate over each tweets and merge medias
    toFormat.data.forEach(tweet => {
        let t = {
            "id": tweet.id,
            "text": tweet.text,
            "medias": []
        }

        if (tweet.attachments && tweet.attachments.media_keys) {
            tweet.attachments.media_keys.forEach(id => {
                let found = toFormat.includes.media.findIndex(function(media, index) {
                    if(id == media.media_key) {
                        return true;
                    }
                });

                if (found != -1) {
                    t.medias.push(toFormat.includes.media[found])
                }
            })
        }

        tweets.push(t);
    })

    return {
        author: author,
        tweets: tweets.reverse()
    }
}

function getTweet(tweetId, headers) {
    return new Promise((resolve, reject) => {
        const url = "https://api.twitter.com/2/tweets?ids=" + tweetId + "&tweet.fields=attachments,conversation_id&media.fields=url&user.fields=name,username,profile_image_url,url&expansions=attachments.media_keys,author_id";
        fetch(url, headers)
            .then((tweet) => tweet.json())
            .then((resp) => resolve(resp))
            .catch((err) => reject(err));
    });
}

function getFollowingTweets(authorId, conversationId, headers) {
    return new Promise((resolve, reject) => {
        const url = "https://api.twitter.com/2/tweets/search/recent?query=(from:" + authorId + " to:" + authorId + " conversation_id:" + conversationId + ")&max_results=100&&expansions=attachments.media_keys&user.fields=username,profile_image_url,description&media.fields=preview_image_url,url";
        fetch(url, headers)
            .then((followingTweets) => followingTweets.json())
            .then((resp) => resolve(resp))
            .catch((err) => reject(err));
    });
}