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