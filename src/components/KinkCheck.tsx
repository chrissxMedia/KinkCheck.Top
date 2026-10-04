import { useEffect, useState } from "preact/hooks";
import { decodeKinkCheck, defaultKinkcheck, encodeKinkCheck, updateCheck, type kinkcheck } from "../base";
import Kink, { type RenderRater } from "./Kink";
import styles from "./KinkCheck.module.css";
import type { kink, TRData, validRating } from "../zod";

export function ExampleTable({ kinks }: { kinks: kink[] }) {
    const [ratings, setRatings] = useState<validRating[][]>(kinks.map(([, positions]) => positions.map(() => 0)));
    const setRating = (kink: number) => (pos: number) => (rat: validRating) => {
        const r = [...ratings];
        r[kink][pos] = rat;
        setRatings(r);
    };
    return <Category kinks={kinks} ratings={ratings} setRating={setRating} />;
}

export function Category({ cat, kinks, ratings, setRating, renderRater }: {
    cat?: string, kinks: kink[], ratings: validRating[][],
    setRating?: (k: number) => (p: number) => (r: validRating) => void, renderRater?: RenderRater
}) {
    return (
        <div class={styles.category}>
            {cat && <h2>{cat}</h2>}
            <table class={styles.table}>
                <tbody>
                    {kinks.map((kink, i) => (
                        <Kink kink={kink} ratings={ratings[i]} setRating={setRating?.(i)} renderRater={renderRater} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function KinkCheck(meta: TRData & { init?: kinkcheck, store?: string }) {
    const [ratings, setRatings] = useState((meta.init ?? defaultKinkcheck(meta)).ratings);
    useEffect(() => {
        const saved = meta.store && window.localStorage.getItem(meta.store);
        if (saved) setRatings(decodeKinkCheck(meta, JSON.parse(saved)).ratings);
    }, []);
    const setRating = (cat: number) => (kink: number) => (pos: number) => (rat: validRating) => {
        const r = [...ratings];
        r[cat][kink][pos] = rat;
        setRatings(r);
        if (meta.store) {
            const old = window.localStorage.getItem(meta.store);
            const x = encodeKinkCheck(meta, { ratings: r });
            const data = old ? updateCheck(JSON.parse(old), x) : x;
            window.localStorage.setItem(meta.store, JSON.stringify(data));
        }
    };
    return <Check kinks={meta.kinks} ratings={ratings} setRating={setRating} />;
}

export function Check({ kinks, ratings, setRating, renderRater }: TRData &
{ ratings: validRating[][][], setRating?: (c: number) => (k: number) => (p: number) => (r: validRating) => void, renderRater?: RenderRater }) {
    return <main class={styles.catcontainer}>
        {
            kinks.map(([cat, kinks], i) => (
                <Category cat={cat} kinks={kinks} ratings={ratings[i]} setRating={setRating?.(i)} renderRater={renderRater} />
            ))
        }
    </main>;
}
