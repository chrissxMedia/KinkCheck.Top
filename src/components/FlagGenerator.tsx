import { useEffect, useState } from "preact/hooks";
import styles from "./FlagGenerator.module.css";

const colors: { [k: string]: string } = {
    "t": "rgb(var(--transblue))",
    "r": "rgb(var(--transpink))",
    "a": "white",
    "n": "rgb(var(--transpink))",
    "s": "rgb(var(--transblue))",
};

export default function FlagGenerator() {
    const [flag, setFlag] = useState("");
    let input: HTMLInputElement;
    const chars = [...flag.toLowerCase()].filter(x => "trans".includes(x));
    const height = 20 / chars.length;
    useEffect(() => input.focus());
    return (
        <main>
            <input ref={x => input = x!} type="text" placeholder="trans, rat, ant, ..."
                spellcheck={false} autocorrect="off" class={styles.input}
                value={flag} onInput={e => setFlag(e.target.value)} />
            {chars.length ? chars.map(x => (
                <div style={{ width: "30em", backgroundColor: colors[x], height: `${height}em` }} />
            )) : <div style={{ width: "30em", backgroundColor: "transparent", height: "20em" }} />}
        </main>
    );
}
