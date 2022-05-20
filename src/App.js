import './App.css';

import React from "react";

import {
  Outlet,
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from './routes/home';
import Thread from './routes/thread';

import Header from './components/header';


function App() {
  return (
    <div className='main'>
        <Header />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="thread/:id" element={<Thread />} />
          </Routes>
        </BrowserRouter>
        <Outlet />
    </div>
  );
}

export default App;