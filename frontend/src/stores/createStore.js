import {create} from "zustand";
import {devtools} from "zustand/middleware"
export const createStore = (storeName, storeFn) =>{
    return create(
        devtools(storeFn, {name: storeName})
    )
}
