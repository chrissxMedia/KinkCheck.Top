import { atom } from "nanostores";
import { type ratings } from "./base";

export const ratingstore = atom<ratings | undefined>();
