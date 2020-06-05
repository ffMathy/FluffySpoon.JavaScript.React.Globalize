[`@fluffy-spoon/react-globalize`](https://www.npmjs.com/package/@fluffy-spoon/react-globalize) is a hook that allows you to share state between components, in a stable and simple manner, without altering React's internal components. 

No magic, just pure simple React. Check the `index.ts` file to see the simplicity of it.

# Usage
First, you need to globally create a key for your state, with an optional initial value.

```typescript
//users.ts

import { createGlobalState } from '@fluffy-spoon/react-globalize';

export const usersKey = createGlobalState([{ firstName: "John", lastName: "Doe" }]);
```

Then, you can simply use it in one of your components, just like you would use `useState`!

```typescript
//index.ts

import { usersKey } from './users';

export const GlobalUserListComponent = () => {

    //users and setUsers behaves like useState, except they are now shared between all components!
    const [users, setUsers] = useGlobalState(usersKey);

    ...
}
```

## Using resources
Resources can be helpful for fetching async data only once, and providing controls for refreshing that data.

```typescript
//users.ts

import { createGlobalResource } from '@fluffy-spoon/react-globalize';

export const usersKey = createGlobalResource(async () => 
    await fetch('https://api.example.com/users'));
```

Usage of resources is very similar to global state, and is also only fetched once. However, the 2nd argument is a "control" object which has a `refresh` and a `set` function.

```typescript
//index.ts

import { usersKey } from './users';

export const GlobalUserListComponent = () => {

    const [users, {usersControl}] = useGlobalResource(usersKey);

    //users now refers to the value, fetched only once and shared.
    //usersControl.refresh() will refresh the value.
    //usersControl.set() will set the value to something.

    ...
}
```