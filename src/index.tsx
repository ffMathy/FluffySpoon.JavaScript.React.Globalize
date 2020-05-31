import { useState, useEffect } from "react";

const state: {
    [key: string]: {
        listeners: Array<(value: any) => void>,
        accessor?: () => any,
        value: any
    }
} = {};

export type GlobalStateKey<T> = {
    state: T
};

export type GlobalResourceKey<T> = {
    resource: T
};

export function createGlobalState<T>(initialState?: T): GlobalStateKey<T> {
    const key = Symbol();
    state[keyAsString(key)] = {
        value: initialState,
        listeners: []
    };

    return key as any;
}

export function createGlobalResource<T>(accessor: () => Promise<T>|T, initialState?: T): GlobalResourceKey<T> {
    const key = Symbol();
    state[keyAsString(key)] = {
        value: initialState,
        accessor,
        listeners: []
    };

    return key as any;
}

export function useGlobalResource<T>(key: GlobalResourceKey<T>): [T, { 
    set: React.Dispatch<React.SetStateAction<T>>, 
    refresh: () => Promise<any> 
}] {
    const [value, setValue] = useGlobalState(key as any as GlobalStateKey<T>);

    const globalStateValue = getStateValueByKey(key);
    useEffect(
        () => {
            if(!globalStateValue.accessor)
                throw new Error('The given key does not represent a resource.');

            Promise.resolve(globalStateValue.accessor()).then(setValue);
        },
        [globalStateValue.accessor]);

    return [
        value,
        {
            set: setValue,
            refresh: () => Promise.resolve(globalStateValue.accessor!()).then(setValue)
        }
    ]
}

export function useGlobalState<T>(key: GlobalStateKey<T>): [T, React.Dispatch<React.SetStateAction<T>>]
{
    if(!key)
        throw new Error("No key provided.");

    const globalStateValue = getStateValueByKey(key);
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

function getStateValueByKey<T>(key: GlobalStateKey<T>|GlobalResourceKey<T>) {
    return state[keyAsString(key)];
}

function keyAsString(key: any) {
    return key as string;
}