import React from 'react';
import './App.css';
import NotesParent from './context/NotesContext';
import SideBar from './components/SideBar';
import Page from './components/Page';

function App() {
  return (
      <NotesParent>
        <div className="App">
          <SideBar />
          <Page />
        </div>
      </NotesParent>
  );
}

export default App;