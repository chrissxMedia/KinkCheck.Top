import { useState, type Dispatch, type StateUpdater } from "preact/hooks";
import styles from "./Rewind.module.css";

function Input({ placeholder, value, setValue }:
    { placeholder: string, value: string, setValue: Dispatch<StateUpdater<string>> }) {
    return <input type="text" spellcheck={false} autocorrect="false"
            placeholder={placeholder} value={value} onInput={(e) => setValue(e.target.value)} />;
}

export default function Rewind() {
    const [sextimes, setSextimes] = useState("0 times");
    const [sexdesc, setSexdesc] = useState("You absolute fucking loser...");
    const [sexmins, setSexmins] = useState("0");
    const [sexpartners, setSexpartners] = useState("0");
    return <main class={styles.main}>
        <div class={styles.settings}>
            <Input placeholder="You had sex" value={sextimes} setValue={setSextimes} />
            <Input placeholder="Description" value={sexdesc} setValue={setSexdesc} />
            <Input placeholder="Minutes had sex" value={sexmins} setValue={setSexmins} />
            <Input placeholder="Partners" value={sexpartners} setValue={setSexpartners} />
        </div>
        <div class={styles.sexrewind + " " + styles.column}>
            <div class={styles.column}>
                <span class={styles.sextext1}>You had sex</span>
                <span class={styles.sextimes}>{sextimes}</span>
                <span class={styles.sextext2}>this year</span>
            </div>
            <span class={styles.sexdesc}>{sexdesc}</span>
            <div class={styles.sexstats}>
                <div class={styles.column}>
                    <span class={styles.sexminstext}>Minutes had sex</span>
                    <span class={styles.sexminsnum}>{sexmins}</span>
                </div>
                <div class={styles.column}>
                    <span class={styles.sexminstext}>Partners</span>
                    <span class={styles.sexminsnum}>{sexpartners}</span>
                </div>
            </div>
        </div>
    </main>;
}
