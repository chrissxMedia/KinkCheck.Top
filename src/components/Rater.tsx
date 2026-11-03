import { useRef } from "preact/hooks";
import { ratings } from "../base";
import type { validRating } from "../zod";
import styles from "./Rater.module.css";

export default function Rater({ text, rating, setRating }:
    { text?: string, rating: validRating, setRating?: (r: validRating) => void }) {
    const pointer = useRef<PointerEvent | null>(null);
    const suppressClick = useRef(false);
    const updateRating = setRating && ((x: -1 | -0.5 | 0.5 | 1) => {
        let newRating = rating + x;
        const max = ratings.length - 1;
        if (newRating === 0.5) newRating = x > 0 ? 1 : 0;
        else if (newRating > max) newRating = 0;
        else if (newRating < 0) newRating = max;
        setRating(newRating as validRating);
    });
    const handleClick = updateRating && ((e: MouseEvent, longPress = false) => {
        e.preventDefault();
        if (e.type === "contextmenu" && (pointer.current && pointer.current.pointerType !== "mouse"
            || "pointerType" in e && (e.pointerType === "touch" || e.pointerType === "pen"))) return;
        if (e.type === "click" && suppressClick.current && e.detail !== 0) {
            suppressClick.current = false;
            return;
        }
        const halfStep = document.documentElement.dataset.raterStep === "half";
        const step = (e.shiftKey || e.altKey || longPress) !== halfStep
            ? (e.button ? -0.5 : 0.5)
            : (e.button ? -1 : 1);
        updateRating(step);
    });
    const cancelPress = setRating && (() => {
        if (pointer.current) suppressClick.current = true;
        pointer.current = null;
    });
    const handlePointerDown = setRating && ((e: PointerEvent) => {
        if (!e.isPrimary || e.button !== 0) return;
        suppressClick.current = false;
        pointer.current = e;
    });
    const handlePointerMove = cancelPress && ((e: PointerEvent) => {
        const start = pointer.current;
        if (!start || start.pointerId !== e.pointerId) return;
        const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
        if (Math.hypot(e.clientX - start.clientX, e.clientY - start.clientY) > 10
            || e.clientX < bounds.left || e.clientX >= bounds.right
            || e.clientY < bounds.top || e.clientY >= bounds.bottom) cancelPress();
    });
    const handlePointerUp = handleClick && handlePointerMove && ((e: PointerEvent) => {
        handlePointerMove(e);
        const start = pointer.current;
        if (!start || start.pointerId !== e.pointerId) return;
        pointer.current = null;
        if (e.timeStamp - start.timeStamp >= 300) {
            handleClick(e, true);
            suppressClick.current = true;
        }
    });
    const handleKey = setRating && updateRating && ((e: KeyboardEvent) => {
        console.log("Key press: " + e.code);
        const x = Number(e.key);
        if (Number.isFinite(x)) {
            setRating((x && (x + 1) / 2) as validRating);
        } else if (e.code === "Equal" || e.code === "Minus") {
            updateRating(e.code === "Equal" ? 0.5 : -0.5);
        }
    });
    const btn = setRating && useRef<HTMLButtonElement>(null);
    const focus = btn && (() => btn.current?.focus({ focusVisible: false, preventScroll: true }));
    const unfocus = btn && (() => btn.current?.blur());
    return (
        <div class={setRating ? styles.clickable : styles.noclick}
            onClick={handleClick} onContextMenu={handleClick}
            onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp} onPointerCancel={cancelPress} onPointerLeave={cancelPress}
            onKeyDown={handleKey} onMouseEnter={focus} onMouseLeave={unfocus}>
            <button data-rating={rating} ref={btn} />
            {text && <span>{text}</span>}
        </div>
    );
}
