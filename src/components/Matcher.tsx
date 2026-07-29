import { useState } from "preact/hooks";
import { decodeKinkCheck, defaultKinkcheck, type kinkcheck } from "../base";
import { Category } from "./KinkCheck";
import kc from "./KinkCheck.module.css";
import styles from "./Matcher.module.css";
import Input from "./Input";
import type { TRData } from "../zod";

function matchRating(a: number, b: number): number {
    if (!a || !b) return a + b;
    if (a == 5 || b == 5) return 5;
    return Math.round(a + b) / 2;
}

export function match({ ratings: a }: kinkcheck, { ratings: b }: kinkcheck): kinkcheck {
    return {
        ratings: a.map((rA, cat) =>
            rA.map((rsA, kink) =>
                rsA.map((ratA, pos) =>
                    matchRating(ratA, b[cat][kink][pos])))),
    };
}

export default function Matcher(meta: TRData) {
    const [partnerA, setPartnerA] = useState("");
    const [partnerB, setPartnerB] = useState("");
    let kcA = defaultKinkcheck(meta);
    let kcB = defaultKinkcheck(meta);
    let errorA, errorB;
    try { kcA = decodeKinkCheck(meta, JSON.parse(partnerA)); } catch (e: any) { errorA = e.toString(); }
    try { kcB = decodeKinkCheck(meta, JSON.parse(partnerB)); } catch (e: any) { errorB = e.toString(); }
    kcB.ratings = kcB.ratings.map(ks => ks.map(rs => rs.toReversed()));
    const matched = match(kcA, kcB);
    return <main>
        <div class={styles.matcherfrontmatter + " " + kc.catcontainer}>
            <p>The resulting KinkCheck is written from Partner A's perspective.</p>
            <Input error={errorA} placeholder="Partner A" value={partnerA} setValue={setPartnerA} className={styles.input} />
            <Input error={errorB} placeholder="Partner B" value={partnerB} setValue={setPartnerB} className={styles.input} />
        </div>
        <div class={kc.catcontainer}>
            {
                meta.kinks.map(([cat, kinks], i) => (
                    <Category cat={cat} kinks={kinks} ratings={matched.ratings[i]} />
                ))
            }
        </div>
    </main>;
}
