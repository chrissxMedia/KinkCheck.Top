import { useEffect, useState } from "preact/hooks";
import { decodeKinkCheck, defaultKinkcheck, encodeKinkCheck, updateCheck, type kinkcheck } from "../base";
import Kink from "./Kink";
import styles from "./KinkCheck.module.css";
import type { kink, TRData } from "../zod";

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
            <h2>{cat}</h2>
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

export default function KinkCheck(meta: TRData & { init?: kinkcheck, store?: string, readonly?: boolean }) {
    if (!meta.init && meta.store) {
        useEffect(() => {
            const saved = meta.store && window.localStorage.getItem(meta.store);
            if (saved) setRatings(decodeKinkCheck(meta, JSON.parse(saved)).ratings);
        }, []);
    }
    const [ratings, setRatings] = useState((meta.init ?? defaultKinkcheck(meta)).ratings);
    const setRating = (cat: number) => (kink: number) => (pos: number) => (rat: number) => {
        const r = [...ratings!];
        r[cat][kink][pos] = rat;
        setRatings(r);
        if (meta.store) {
            const old = window.localStorage.getItem(meta.store);
            const x = encodeKinkCheck(meta, { ratings: r });
            const data = old ? updateCheck(JSON.parse(old), x) : x;
            window.localStorage.setItem(meta.store, JSON.stringify(data));
        }
    };
    return <main class={styles.catcontainer}>
        {
            meta.kinks.map(([cat, kinks], i) => (
                <Category cat={cat} kinks={kinks} ratings={ratings[i]}
                    setRating={meta.readonly ? undefined : setRating(i)} />
            ))
        }
    </main>;
}
