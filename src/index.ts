import { useState, useEffect } from "react";

const state: {
    [key: string]: {
        listeners: Array<(value: any) => void>,
        value: any
    }
} = {};

export type GlobalStateKey<T> = {};

export function createGlobal<T>(initialState?: T): GlobalStateKey<T> {
    const key = Symbol();
    state[keyAsString(key)] = {
        value: initialState,
        listeners: []
    };

    return key;
}

export function useGlobal<T>(key: GlobalStateKey<T>): [T, React.Dispatch<React.SetStateAction<T>>]
{
    if(!key)
        throw new Error("No key provided.");

    const globalStateValue = state[keyAsString(key)];
    if(!globalStateValue)
        throw new Error('The state has not been created first with createGlobalState.');

    const [localState, setLocalState] = useState(globalStateValue.value as T);
    useEffect(
        () => {
            const cleanup = () => {
                globalStateValue
                    .listeners
                    .splice(globalStateValue
                        .listeners
                        .indexOf(setLocalState));
            };

            if(globalStateValue.listeners.indexOf(setLocalState) > -1)
                return cleanup;

            globalStateValue
                .listeners
                .push(setLocalState);
            return cleanup;
        },
        [globalStateValue.listeners]);

    useEffect(
        () => {
            globalStateValue.value = localState;
            globalStateValue
                .listeners
                .filter(listener => listener !== setLocalState)
                .forEach(listener => listener(localState));
        },
        [
            localState,
            globalStateValue
        ]);

    return [localState, setLocalState];
}

function keyAsString(key: GlobalStateKey<any>) {
    return key as any as string;
}