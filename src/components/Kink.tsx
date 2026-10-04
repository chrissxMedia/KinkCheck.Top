import type { kink, validRating } from "../zod";
import Rater from "./Rater";
import styles from "./Kink.module.css";
import type { ComponentProps, VNode } from "preact";

export type RenderRater = (props: ComponentProps<typeof Rater> & { label: string }) => VNode;

export default function Kink({ kink: [kink, positions, , description], ratings, setRating, renderRater }:
    { kink: kink, ratings: validRating[], setRating?: (p: number) => (r: validRating) => void, renderRater?: RenderRater }) {
    return (
        <tr class={styles.tr}>
            <td class={styles.td}>
                <span>{kink}</span>
                {description && <span class={styles.desc}>{description}</span>}
            </td>
            {positions.map((pos, p) => (
                <td class={styles.td}>
                    {renderRater ? renderRater({ text: pos, rating: ratings[p], setRating: setRating?.(p), label: `${kink}, ${pos || "rating"}` })
                        : <Rater text={pos} rating={ratings[p]} setRating={setRating && setRating(p)} />}
                </td>
            ))}
            {positions.length === 1 && <td />}
        </tr>
    );
}
