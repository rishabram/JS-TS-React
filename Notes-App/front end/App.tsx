import React from 'react';
import './App.css';
import NotesParent from './context/NotesContext';
import SideBar from './components/SideBar';
import Page from './components/Page';

function App():React.ReactElement {
  return (
      <NotesParent>
        <div className="flex min-h-screen bg-gray-100">
          <SideBar />
          <Page />
        </div>
      </NotesParent>
  );
}

export default App;