import './App.css';

import React from "react";

import {
  BrowserRouter as Router,
  useLocation
} from "react-router-dom";

import ThreadOperator from './components/threadOperator';
import Onboarder from './components/onboarder';

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}


function Parent() {
  let query = useQuery();

  return(
    <div className='main'>
      <div className="header">
        <div className="logo">wit</div>
        <div className="hero">Turn any Twitter thread into an insightful reading.</div>
      </div>

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
        <Onboarder />
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