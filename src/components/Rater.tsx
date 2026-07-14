import { useRef } from "preact/hooks";
import { ratings, raterBackground } from "../base";
import styles from "./Rater.module.css";

export default function Rater({ text, rating, setRating }:
    { text?: string, rating: number, setRating?: (r: number) => void }) {
    const updateRating = setRating && ((x: number) => {
        let newRating = rating + x;
        const max = ratings.length - 1;
        if (newRating === 0.5) newRating = x > 0 ? 1 : 0;
        else if (newRating > max) newRating = 0;
        else if (newRating < 0) newRating = max;
        setRating(newRating);
    });
    const handleClick = updateRating && ((e: MouseEvent) => {
        e.preventDefault();
        const step = e.shiftKey || e.altKey ? 0.5 : 1;
        updateRating(e.button ? -step : +step);
    });
    const handleKey = setRating && updateRating && ((e: KeyboardEvent) => {
        console.log("Key press: " + e.code);
        const x = Number(e.key);
        if (Number.isFinite(x)) {
            setRating(x && (x + 1) / 2);
        } else if (e.code === "Equal" || e.code === "Minus") {
            updateRating(e.code === "Equal" ? +0.5 : -0.5);
        }
    });
    const btn = setRating && useRef<HTMLButtonElement>(null);
    const focus = btn && (() => btn.current?.focus({ focusVisible: false, preventScroll: true }));
    const unfocus = btn && (() => btn.current?.blur());
    return (
        <div class={setRating ? styles.clickable : styles.noclick}
            onClick={handleClick} onContextMenu={handleClick}
            onKeyDown={handleKey} onMouseEnter={focus} onMouseLeave={unfocus}>
            <button style={{ background: raterBackground(rating) }} ref={btn} />
            {text && <span>{text}</span>}
        </div>
    );
}
