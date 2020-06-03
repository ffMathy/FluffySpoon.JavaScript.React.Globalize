import React from 'react'

import { createGlobalState, useGlobalState, createGlobalResource, useGlobalResource } from '@fluffy-spoon/react-globalize'

const globalState = createGlobalState("hello world");
const globalResource = createGlobalResource(async (signal) => {
  await new Promise(resolve => setTimeout(resolve, 5000));
  return "cancelled: " + signal.aborted + " " + new Date().getTime();
});

const App = () => {
  const [resource, resourceControl] = useGlobalResource(globalResource);
  const [otherResource, otherResourceControl] = useGlobalResource(globalResource);

  const [state, setState] = useGlobalState(globalState);
  const [otherState, otherSetState] = useGlobalState(globalState);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {state}
        </p>
        <p>
          {resource}
        </p>
      </header>

      <hr/>

      <header className="App-header">
        <p>
          {otherState}
        </p>
        <p>
          {otherResource}
        </p>
      </header>

      <hr/>

      <button onClick={() => setState(state + " lol")}>Do state set</button>
      <button onClick={() => resourceControl.refresh()}>Do resource refresh</button>
      <button onClick={() => resourceControl.set(resource + " lol")}>Do resource set</button>

      <hr/>

      <button onClick={() => otherSetState(otherState + " lol")}>Do other state set</button>
      <button onClick={() => otherResourceControl.refresh()}>Do other resource refresh</button>
      <button onClick={() => otherResourceControl.set(otherResource + " lol")}>Do other resource set</button>

    </div>
  );
}
export default App
