import './App.css';

import React from "react";

import {
  BrowserRouter as Router,
  useLocation
} from "react-router-dom";

import ThreadOperator from './components/threadOperator';

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}


function Parent() {
  let query = useQuery();

  return(
    <div className='main'>
      <div className="logo">wit</div>
      <div className="hero">Turn any Twitter thread into an insightful reading.</div>

      <Child tweetId={query.get("tweetId")} />
    </div>
  );
}

function Child({ tweetId }) {
  return (
    <div>
      {tweetId ? (
        <ThreadOperator tweetId={tweetId} />
      ) : (
        <h3>There is no tweetId</h3>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Parent />
    </Router>
  );
}

export default App;