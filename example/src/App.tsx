import React, { useState } from 'react'

import { createGlobalState, useGlobalState, createGlobalResource, useGlobalResource } from '@fluffy-spoon/react-globalize'

const globalState = createGlobalState("hello world");
const globalResource = createGlobalResource(async (signal) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('fetching global');
  return "cancelled: " + signal.aborted + " " + new Date().getTime();
});
const globalFailedResource = createGlobalResource<string>(async (signal) => {
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log('fetching global failed');
  throw new Error();
}, "default");

const BaseComponent = (props: {id: number}) => {
  const [resource, resourceControl] = useGlobalResource(globalResource);
  const [otherResource, otherResourceControl] = useGlobalResource(globalResource);

  const [failedResource, failedResourceControl] = useGlobalResource(globalFailedResource);
  const [otherFailedResource, otherFailedResourceControl] = useGlobalResource(globalFailedResource);

  const [state, setState] = useGlobalState(globalState);
  const [otherState, otherSetState] = useGlobalState(globalState);

  return (
    <div className="App">
      <header className="App-header">
        <h1>{props.id}</h1>
        <p>
          {state}
        </p>
        <p>
          {resource}
        </p>
        <p>
          {failedResource}
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
        <p>
          {otherFailedResource}
        </p>
      </header>

      <hr/>

      <button onClick={() => setState(state + " lol")}>Do state set</button>
      <button onClick={() => otherSetState(otherState + " lol")}>Do other state set</button>

      <hr/>

      <button onClick={() => resourceControl.refresh()}>Do resource refresh</button>
      <button onClick={() => resourceControl.set(resource + " lol")}>Do resource set</button>

      <br/>

      <button onClick={() => otherResourceControl.refresh()}>Do other resource refresh</button>
      <button onClick={() => otherResourceControl.set(otherResource + " lol")}>Do other resource set</button>

      <hr/>

      <button onClick={() => failedResourceControl.refresh()}>Do failed resource refresh</button>
      <button onClick={() => failedResourceControl.set(failedResource + " lol")}>Do failed resource set</button>

      <br/>

      <button onClick={() => otherFailedResourceControl.refresh()}>Do other failed resource refresh</button>
      <button onClick={() => otherFailedResourceControl.set(otherFailedResource + " lol")}>Do other failed resource set</button>

    </div>
  );
}

let offset = 1;

const App = () => {
  const [components, setComponents] = useState([offset]);
  return <div>
    <button onClick={() => setComponents([...components, ++offset])}>Add</button>
    <button onClick={() => setComponents(components.slice(1))}>Remove</button>
    {components.map(c => <BaseComponent key={c} id={c} />)}
  </div>
}

export default App
