import { $dark, $light } from "app/theme";
import { atom, selector } from "recoil";

export const ThemeState = atom<'dark' | 'light'>({
    key: "Theme",
    default: "dark",
});
export const LangState = atom<string>({
    key: "Lang",
    default: "en",
});
export const ColorsState = selector({
    key: 'ColorsState',
    get: ({ get }) => {
        const themeState = get(ThemeState);
        return themeState == "dark" ? $dark : $light;
    },
});