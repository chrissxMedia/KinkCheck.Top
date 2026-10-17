import { useRef } from "preact/hooks";
import type { kink, validRating } from "../zod";
import Rater from "./Rater";
import styles from "./Kink.module.css";

export default function Kink({ kink: [kink, positions, , description], ratings, setRating }:
    { kink: kink, ratings: validRating[], setRating?: (p: number) => (r: validRating) => void }) {
    const desc = useRef<HTMLSpanElement>(null);
    const positionDescription = () => {
        if (!desc.current) return;
        const cell = desc.current.parentElement!.getBoundingClientRect();
        const tooltip = desc.current.getBoundingClientRect();
        desc.current.style.left = `${Math.max(8, Math.min(cell.left, document.documentElement.clientWidth - tooltip.width - 8))}px`;
        desc.current.style.top = `${cell.bottom + tooltip.height <= window.innerHeight - 8
            ? cell.bottom : Math.max(8, cell.top - tooltip.height)}px`;
    };
    return (
        <tr class={styles.tr}>
            <td class={styles.td} onMouseEnter={description ? positionDescription : undefined}>
                <span>{kink}</span>
                {description && <span class={styles.desc} ref={desc}>{description}</span>}
            </td>
            {positions.map((pos, p) => (
                <td class={styles.td}>
                    <Rater text={pos} rating={ratings[p]} setRating={setRating && setRating(p)} />
                </td>
            ))}
            {positions.length === 1 && <td />}
        </tr>
    );
}
