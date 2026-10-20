import { useEffect, useId, useRef, useState } from "preact/hooks";
import { ratings } from "../base";
import type { validRating } from "../zod";
import styles from "./Rater.module.css";

function formatRating(rating: validRating) {
    return `${rating} · ${Number.isInteger(rating) ? ratings[rating]
        : `${ratings[Math.floor(rating)]} / ${ratings[Math.ceil(rating)]}`}`;
}

export default function Rater({ label, text, rating, setRating }:
    { label?: string, text?: string, rating: validRating, setRating?: (r: validRating) => void }) {
    const [picker, setPicker] = useState(false);
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
        let input = navigator.maxTouchPoints > 0 ? "picker" : "full";
        try {
            const preferred = document.documentElement.dataset.raterStep
                ?? localStorage.getItem("rater-step");
            if (preferred && ["full", "half", "picker"].includes(preferred)) input = preferred;
        } catch {}
        if (e.button === 0 && input === "picker") {
            setPicker(true);
            return;
        }
        const halfStep = input === "half";
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
        if (/^[0-9]$/.test(e.key)) {
            setRating((x && (x + 1) / 2) as validRating);
        } else if (e.code === "Equal" || e.code === "Minus") {
            updateRating(e.code === "Equal" ? 0.5 : -0.5);
        }
    });
    const btn = useRef<HTMLButtonElement>(null);
    const focus = setRating && (() => btn.current?.focus({ focusVisible: false, preventScroll: true }));
    const unfocus = setRating && (() => btn.current?.blur());
    return (
        <>
            <div class={setRating ? styles.clickable : styles.noclick}
                onClick={handleClick} onContextMenu={handleClick}
                onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp} onPointerCancel={cancelPress} onPointerLeave={cancelPress}
                onKeyDown={handleKey} onMouseEnter={focus} onMouseLeave={unfocus}>
                <button type="button" class={styles.rating} data-rating={rating} ref={btn}
                    tabIndex={setRating ? 0 : -1}
                    aria-label={`${label ?? text ?? "Rating"}, ${formatRating(rating)}`} />
                {text && <span>{text}</span>}
            </div>
            {picker && setRating && <RatingPicker label={label ?? text ?? "Rating"}
                rating={rating} setRating={setRating} close={() => setPicker(false)} />}
        </>
    );
}

function RatingPicker({ label, rating, setRating, close }: {
    label: string, rating: validRating, setRating: (rating: validRating) => void, close: () => void,
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    const title = useId();
    useEffect(() => { dialog.current?.showModal(); }, []);

    return <dialog ref={dialog} class={styles.picker} aria-labelledby={title}
        onClose={close} onPointerDown={(event) => {
            if (event.target !== event.currentTarget) return;
            const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect();
            if (event.clientX < left || event.clientX >= right
                || event.clientY < top || event.clientY >= bottom) dialog.current?.close();
        }}>
        <div class={styles.pickerContent}>
            <h2 id={title}>{label}</h2>
            <div class={styles.options}>
                {([0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const).map((value) =>
                    <button key={value} type="button" autoFocus={value === rating}
                        aria-pressed={value === rating} onClick={() => {
                            setRating(value);
                            dialog.current?.close();
                        }}>
                        <span class={styles.rating} data-rating={value} aria-hidden="true" />
                        <span>{formatRating(value)}</span>
                    </button>)}
            </div>
            <button type="button" class={styles.cancel} onClick={() => dialog.current?.close()}>Cancel</button>
        </div>
    </dialog>;
}
