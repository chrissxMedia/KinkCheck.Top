import { useEffect, useState } from "preact/hooks";
import { encodeKinkCheck, type ratings, type kink, type kinkcheck, type kinklist, type TemplateRevision } from "../base";
import Kink from "./Kink";
import styles from "./KinkCheck.module.css";
import { useStore } from "@nanostores/preact";
import { ratingstore } from "../kcstore";

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

export function Check({ kinks, ratings, setRating }: {
    kinks: kinklist, ratings: ratings,
    setRating?: (c: number) => (k: number) => (p: number) => (r: number) => void
}) {
    return <div class={styles.catcontainer}>
        {
            kinks.map(([cat, kinks], c) => (
                <Category cat={cat} kinks={kinks} ratings={ratings[c]} setRating={setRating && setRating(c)} />
            ))
        }
    </div>;
}

export function KinkCheck(meta: TemplateRevision & { init: kinkcheck }) {
    let ratings = useStore(ratingstore) ?? meta.init.ratings;
    // FIXME:
    useEffect(() => {
        ratingstore.set(ratings = meta.init.ratings);
    }, [meta.init.ratings]);
    const setRating = (cat: number) => (kink: number) => (pos: number) => (rat: number) => {
        const r = [...ratings!];
        r[cat][kink][pos] = rat;
        ratingstore.set(r);
        console.log(encodeKinkCheck(meta, { ratings: r }));
    };
    return <Check kinks={meta.kinks} ratings={ratings!} setRating={setRating} />;
}
