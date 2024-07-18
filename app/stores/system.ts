import { $dark, $light } from "app/theme";
import { globalStorage } from "app/utils/kv-tool";
import { atom, selector } from "recoil";

export const ThemeState = atom<'dark' | 'light'>({
    key: "Theme",
    default: "dark",
});
export const LangState = atom<string>({
    key: "Lang",
    default: "en",
    effects_UNSTABLE: [
        ({ setSelf, onSet }) => {
            onSet((newValue) => {
                globalStorage.set('Lang',newValue);
            })
        },
    ]
});
export const ColorsState = selector({
    key: 'ColorsState',
    get: ({ get }) => {
        const themeState = get(ThemeState);
        console.log('themestate=',themeState);
        
        return themeState == "dark" ? $dark : $light;
    },
});