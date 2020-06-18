import { useState, useEffect } from "react";

type ResourceState = 
    "initial" |
    "fetching" |
    "fetched";

const state: {
    [key: string]: {
        listeners: Array<(value: any) => void>,
        accessor?: (abortSignal: AbortSignal) => any,
        state?: ResourceState,
        default?: any,
        value: any
    }
} = {};

export type GlobalStateKey<T> = {
    state: T
};

export type GlobalResourceKey<T> = {
    resource: T
};

let keyOffset = 0;
function generateNewKey() {
    if (typeof Symbol !== 'function')
        return "key-" + (++keyOffset);

    return Symbol();
}

export function createGlobalState<T>(initialState?: T): GlobalStateKey<T> {
    const key = generateNewKey();
    state[keyAsString(key)] = {
        value: initialState,
        listeners: []
    };

    return key as any;
}

export function createGlobalResource<T>(accessor: (abortSignal: AbortSignal) => Promise<T>|T, initialState?: T): GlobalResourceKey<T> {
    const key = generateNewKey();
    state[keyAsString(key)] = {
        value: initialState,
        default: initialState,
        accessor,
        state: "initial",
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

            if(globalStateValue.state !== "initial")
                return;

            globalStateValue.state = "fetching";
            const reset = () => {
                globalStateValue.state = "initial";
                setValue(globalStateValue.default);
            };

            const abortController = new AbortController();
            try {
                Promise
                    .resolve(globalStateValue
                        .accessor(abortController.signal))
                    .then(v => {
                        if(abortController.signal.aborted) {
                            reset();
                            return;
                        }

                        globalStateValue.state = "fetched";
                        setValue(v);
                    })
                    .catch(reset);
            } catch(ex) {
                reset();
                throw ex;
            }

            return () => {
                abortController.abort();
            };
        },
        []);

    return [
        value,
        {
            set: setValue,
            refresh: () => Promise.resolve(globalStateValue.accessor!(new AbortController().signal)).then(setValue)
        }
    ]
}

export function useGlobalState<T>(key: GlobalStateKey<T>): [T, React.Dispatch<React.SetStateAction<T>>]
{
    const globalStateValue = getStateValueByKey(key);
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
        []);

    useEffect(
        () => {
            if(localState === globalStateValue.value)
                return;

            globalStateValue.value = localState;
            globalStateValue
                .listeners
                .filter(listener => listener !== setLocalState)
                .forEach(listener => listener(localState));
        },
        [
            localState
        ]);

    return [localState, setLocalState];
}

function getStateValueByKey<T>(key: GlobalStateKey<T>|GlobalResourceKey<T>) {
    return state[keyAsString(key)];
}

function keyAsString(key: any) {
    return key as string;
}