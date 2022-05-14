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

        // API response creation
        const followingTweetsData = (followingTweets.data && followingTweets.data.length) ? followingTweets.data : [];
        const followingTweetsMedias = (followingTweets.includes && followingTweets.includes.media && followingTweets.includes.media.length) ? followingTweets.includes.media : [];

        // Inject extracted medias to their related tweet object
        followingTweetsMedias.forEach(media => {
            let found = followingTweetsData.findIndex(function(tweet, index) {
                if(tweet.attachments && tweet.attachments.media_keys == media.media_key) {
                    return true;
                }
            });

            if (found) {
                followingTweetsData[found].media = media;
                delete followingTweetsData[found].attachments;
            }
        });

        const tweets = [{
            'id': firstTweet.data[0].id,
            'text': firstTweet.data[0].text,
            'media': (firstTweet.includes && firstTweet.includes.media && firstTweet.includes.media.length) ? firstTweet.includes.media[0] : null
        }, ...followingTweetsData.reverse()]; // Following tweets are reversed to be displayed in their order of creation

        let result = {
            'author': firstTweet.includes.users[0],
            'tweets': tweets
        };

        result = JSON.stringify(result);

        await WIT_THREADS.put(tweetId, result);
    }

    return new Response(result, responseHeaders);
}

function getTweet(tweetId, headers) {
    return new Promise((resolve, reject) => {
        const url = "https://api.twitter.com/2/tweets?ids=" + tweetId + "&tweet.fields=author_id&user.fields=name,username,profile_image_url,url&expansions=author_id";
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