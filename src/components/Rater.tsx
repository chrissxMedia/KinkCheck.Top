import { useEffect, useId, useRef, useState } from "preact/hooks";
import { ratings } from "../base";
import type { validRating } from "../zod";
import styles from "./Rater.module.css";

export default function Rater({ label, text, rating, setRating }:
    { label?: string, text?: string, rating: validRating, setRating?: (r: validRating) => void }) {
    const [picker, setPicker] = useState(false);
    const updateRating = setRating && ((x: -1 | -0.5 | 0.5 | 1) => {
        let newRating = rating + x;
        const max = ratings.length - 1;
        if (newRating === 0.5) newRating = x > 0 ? 1 : 0;
        else if (newRating > max) newRating = 0;
        else if (newRating < 0) newRating = max;
        setRating(newRating as validRating);
    });
    const handleClick = updateRating && ((e: MouseEvent) => {
        e.preventDefault();
        let input = navigator.maxTouchPoints > 0 ? "picker" : "full";
        try {
            input = document.documentElement.dataset.raterStep
                ?? localStorage.getItem("rater-step") ?? input;
        } catch {}
        if (e.button === 0 && input === "picker") {
            setPicker(true);
            return;
        }
        const halfStep = input === "half";
        const step = (e.shiftKey || e.altKey) !== halfStep
            ? (e.button ? -0.5 : 0.5)
            : (e.button ? -1 : 1);
        updateRating(step);
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
                onKeyDown={handleKey} onMouseEnter={focus} onMouseLeave={unfocus}>
                <button type="button" data-rating={rating} ref={btn}
                    tabIndex={setRating ? 0 : -1} aria-label={label ?? text ?? "Rating"} />
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
            if (event.target === event.currentTarget) dialog.current?.close();
        }}>
        <div class={styles.pickerContent}>
            <h2 id={title}>{label}</h2>
            <div class={styles.options}>
                {([0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const).map((value) => <div key={value}>
                    <Rater rating={value} />
                    <button type="button" autoFocus={value === rating}
                        aria-pressed={value === rating} onClick={() => {
                            setRating(value);
                            dialog.current?.close();
                        }}>{value} · {Number.isInteger(value) ? ratings[value]
                            : `${ratings[Math.floor(value)]} / ${ratings[Math.ceil(value)]}`}</button>
                </div>)}
            </div>
            <button type="button" class={styles.cancel} onClick={() => dialog.current?.close()}>Cancel</button>
        </div>
    </dialog>;
}
