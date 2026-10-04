import type { kink, validRating } from "../zod";
import Rater from "./Rater";
import styles from "./Kink.module.css";

export default function Kink({ kink: [kink, positions, , description], ratings, setRating }:
    { kink: kink, ratings: validRating[], setRating?: (p: number) => (r: validRating) => void }) {
    return (
        <tr class={styles.tr}>
            <td class={styles.td}>
                <span>{kink}</span>
                {description && <span class={styles.desc}>{description}</span>}
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
