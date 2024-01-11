import { useState } from "preact/hooks";
import { defaultRatings, encodeKinkCheck, type kink, type template_revision } from "../base";
import Kink from "./Kink";
import styles from "./KinkCheck.module.css";

export function ExampleTable({ kinks }: { kinks: kink[] }) {
    const [ratings, setRatings] = useState(kinks.map(([, positions]) => positions.map(() => 0)));
    const setRating = (kink: number) => (pos: number) => (rat: number) => {
        const p = ratings[kink];
        p[pos] = rat;
        const r = ratings;
        r[kink] = p;
        console.log(r);
        setRatings(r);
    };
    console.log(ratings);
    return <table class={styles.table}>
        <tbody>
            {kinks.map((kink, i) => <Kink kink={kink} ratings={ratings[i]} setRating={setRating(i)} />)}
        </tbody>
    </table>;
}

export function Category({ cat, kinks, ratings, setRating }: {
    cat: string, kinks: kink[], ratings: number[][],
    setRating?: (k: number) => (p: number) => (r: number) => void
}) {
    return (
        <div class={styles.category}>
            <h2 class={styles.catname}>{cat}</h2>
            <table class={styles.table}>
                <tbody>
                    {kinks.map((kink, i) => (
                        <Kink kink={kink} ratings={ratings[i]} setRating={setRating && setRating(i)} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function KinkCheck(meta: template_revision) {
    const [ratings, setRatings] = useState(defaultRatings(meta.kinks));
    const setRating = (cat: number) => (kink: number) => (pos: number) => (rat: number) => {
        const r = [...ratings!];
        r[cat][kink][pos] = rat;
        setRatings(r);
        console.log(encodeKinkCheck(meta, { ratings: r }));
    };
    return <main class={styles.catcontainer}>
        {
            meta.kinks.map(([cat, kinks], c) => (
                <Category cat={cat} kinks={kinks} ratings={ratings[c]} setRating={setRating(c)} />
            ))
        }
    </main>;
}
