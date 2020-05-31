import React from 'react'

import { createGlobalState, useGlobalState } from '@fluffy-spoon/react-globalize'

const globalState = createGlobalState("hello world");

const App = () => {
  const [state, setState] = useGlobalState(globalState);
  return (
    <div className="App">
      <header className="App-header">
        <p>
          {state}
        </p>
      </header>
      <button onClick={() => setState(state + " lol")}>Do stuff</button>
    </div>
  );
}
export default App
