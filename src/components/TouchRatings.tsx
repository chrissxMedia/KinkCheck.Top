import { createPortal } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";
import { ratings } from "../base";
import type { kinklist, validRating } from "../zod";
import Rater from "./Rater";
import { Check } from "./KinkCheck";
import styles from "./TouchRatings.module.css";

export const prototypes = [
    { id: "mode", name: "Full / half toggle", instruction: "Choose an increment, then tap ratings. The same toggle is also in the sidebar.", tradeoff: "Fast for filling a whole Check. You have to remember which mode is active." },
    { id: "long-press", name: "Long press for a half step", instruction: "Tap for a full step. Hold for 450 ms, then release for a half step. Moving cancels the hold.", tradeoff: "Keeps the layout compact. Every half step takes a short wait." },
    { id: "hold-picker", name: "Long press for a picker", instruction: "Tap for a full step. Hold for 450 ms to open all ratings, then lift your finger and choose one.", tradeoff: "One hold reaches every value. The picker interrupts the table." },
    { id: "swipe", name: "Swipe for half steps", instruction: "Tap for a full step. Swipe right by at least 32 px for +½, or left for −½. Release to commit.", tradeoff: "Quick in both directions. Horizontal gestures need room and practice." },
    { id: "scrub", name: "Drag to scrub", instruction: "Tap for a full step. Drag left or right, one rating position per 28 px. Release to commit.", tradeoff: "Can cross several values in one movement. Stops at the ends instead of wrapping." },
    { id: "picker", name: "Tap to open a picker", instruction: "Tap a rating to open a bottom sheet. Pick any whole or half rating directly.", tradeoff: "Clear choices and no cycling. Two taps for each change." },
] as const;

type Method = typeof prototypes[number]["id"];
const values: validRating[] = [0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

function describe(rating: validRating) {
    return Number.isInteger(rating) ? ratings[rating]
        : `${ratings[Math.floor(rating)]} / ${ratings[Math.ceil(rating)]}`;
}

function advance(rating: validRating, step: number): validRating {
    let next = rating + step;
    if (next === 0.5) next = step > 0 ? 1 : 0;
    else if (next > 5) next = 0;
    else if (next < 0) next = 5;
    return next as validRating;
}

function TouchRating({ method, label, text, rating, step, setRating, openPicker }: {
    method: Method, label: string, text?: string, rating: validRating, step: number,
    setRating: (rating: validRating) => void, openPicker: () => void,
}) {
    const [holding, setHolding] = useState(false);
    const [held, setHeld] = useState(false);
    const [preview, setPreview] = useState<validRating | null>(null);
    const holdTimer = useRef<ReturnType<typeof setTimeout>>();
    const pointer = useRef<{ id: number, x: number, y: number, rating: validRating, moved: boolean, held: boolean } | null>(null);
    const suppressClick = useRef(false);
    const horizontal = method === "swipe" || method === "scrub";
    const longPress = method === "long-press" || method === "hold-picker";

    useEffect(() => () => {
        clearTimeout(holdTimer.current);
    }, []);

    function cancel() {
        clearTimeout(holdTimer.current);
        pointer.current = null;
        suppressClick.current = true;
        setHolding(false);
        setHeld(false);
        setPreview(null);
    }

    const shown = preview ?? rating;
    return (
        <div class={`${styles.gesture} ${horizontal || longPress ? styles.horizontal : ""} ${longPress ? styles.longPress : ""}`}
            data-label={label} data-holding={holding} data-held={held}
            onPointerDown={(event) => {
                if (!event.isPrimary || event.button !== 0) return;
                suppressClick.current = false;
                if (!longPress && !horizontal) return;
                pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, rating, moved: false, held: false };
                event.currentTarget.setPointerCapture(event.pointerId);
                if (longPress) {
                    setHolding(true);
                    holdTimer.current = setTimeout(() => {
                        if (!pointer.current) return;
                        pointer.current.held = true;
                        setHeld(true);
                        if (method === "hold-picker") {
                            suppressClick.current = true;
                            openPicker();
                        }
                    }, 450);
                }
            }}
            onPointerMove={(event) => {
                const start = pointer.current;
                if (!start || start.id !== event.pointerId) return;
                const dx = event.clientX - start.x, dy = event.clientY - start.y;
                if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
                    cancel();
                    return;
                }
                if (longPress && Math.hypot(dx, dy) > 10) {
                    cancel();
                    return;
                }
                if (horizontal && Math.abs(dx) > 10) {
                    start.moved = true;
                    setPreview(method === "swipe"
                        ? Math.abs(dx) >= 32 ? advance(start.rating, dx > 0 ? 0.5 : -0.5) : start.rating
                        : values[Math.max(0, Math.min(values.length - 1, values.indexOf(start.rating) + Math.round(dx / 28)))]);
                }
            }}
            onPointerUp={(event) => {
                const start = pointer.current;
                if (!start || start.id !== event.pointerId) return;
                clearTimeout(holdTimer.current);
                if (start.held || start.moved) {
                    suppressClick.current = true;
                    if (method === "long-press" && start.held) setRating(advance(start.rating, 0.5));
                    else if (horizontal && preview !== null) setRating(preview);
                }
                pointer.current = null;
                setHolding(false);
                setHeld(false);
                setPreview(null);
            }}
            onPointerCancel={cancel}
            onLostPointerCapture={() => { if (pointer.current) cancel(); }}
            onContextMenuCapture={(event) => {
                event.stopPropagation();
                event.preventDefault();
                if (!longPress) setRating(advance(rating, event.shiftKey || event.altKey ? -0.5 : -1));
            }}
            onClickCapture={(event) => {
                event.stopPropagation();
                event.preventDefault();
                if (suppressClick.current && event.detail !== 0) {
                    suppressClick.current = false;
                    return;
                }
                if (method === "picker") openPicker();
                else setRating(advance(rating, event.shiftKey || event.altKey ? 0.5 : step));
            }}>
            <Rater text={text} rating={shown} setRating={setRating} />
            {holding && <span class={styles.holdFeedback}>{held ? "Ready" : "Hold…"}</span>}
        </div>
    );
}

export default function TouchRatings({ method, kinks }: { method: Method, kinks: kinklist }) {
    const exampleRatings = () => kinks.map(([, items]) => items.map(([, positions], i) => positions.map((_, p) => values[(i * 2 + p + 1) % values.length])));
    const [check, setCheck] = useState(exampleRatings);
    const [half, setHalf] = useState(false);
    const [sidebar, setSidebar] = useState<HTMLElement | null>(null);
    const [selected, setSelected] = useState<{ label: string, rating: validRating, setRating: (rating: validRating) => void } | null>(null);
    const dialog = useRef<HTMLDialogElement>(null);

    useEffect(() => { setSidebar(document.querySelector("#sidebar nav")); }, []);
    useEffect(() => { if (selected) dialog.current?.showModal(); }, [selected]);

    function update(c: number, k: number, p: number, value: validRating) {
        setCheck((current) => current.map((category, ci) => ci !== c ? category
            : category.map((item, ki) => ki !== k ? item : item.map((rating, pi) => pi === p ? value : rating))));
    }

    const toggle = <div class={styles.mode} role="group" aria-label="Rating increment">
        <button type="button" class={styles.button} aria-pressed={!half} onClick={() => setHalf(false)}>Full steps</button>
        <button type="button" class={styles.button} aria-pressed={half} onClick={() => setHalf(true)}>Half steps</button>
    </div>;

    return <>
        {method === "mode" && <div class={styles.toolbar}>{toggle}</div>}
        {method === "mode" && sidebar && createPortal(<div class={styles.sidebarMode}>
            <h2>Prototype increment</h2>{toggle}
        </div>, sidebar)}
        <Check kinks={kinks} ratings={check}
            setRating={(c) => (k) => (p) => (value) => update(c, k, p, value)}
            renderRater={({ label, text, rating, setRating }) => <TouchRating
                method={method} label={label} text={text} rating={rating} setRating={setRating!} step={half ? 0.5 : 1}
                openPicker={() => setSelected({ label, rating, setRating: setRating! })} />} />
        <dialog ref={dialog} class={styles.picker} aria-labelledby="rating-picker-title"
            onClose={() => setSelected(null)} onClick={(event) => {
                if (event.target === event.currentTarget) dialog.current?.close();
            }}>
            {selected && <div class={styles.pickerContent}>
                <h2 id="rating-picker-title">{selected.label}</h2>
                <div class={styles.options}>
                    {values.map((value) => <div key={value}>
                        <Rater rating={value} />
                        <button type="button" autoFocus={value === selected.rating}
                        aria-pressed={value === selected.rating} onClick={() => {
                            selected.setRating(value);
                            dialog.current?.close();
                        }}>{value} · {describe(value)}</button>
                    </div>)}
                </div>
                <button type="button" class={styles.button} onClick={() => dialog.current?.close()}>Cancel</button>
            </div>}
        </dialog>
    </>;
}
