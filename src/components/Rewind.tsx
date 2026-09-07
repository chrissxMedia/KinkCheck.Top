import styles from "./Rewind.module.css";

export default function Rewind() {
    return <main class={styles.main}>
        <div class={styles.sexrewind + " " + styles.column}>
            <div class={styles.column}>
                <span class={styles.sextext1}>You had sex</span>
                <span class={styles.sextimes + " " + styles.editable} contentEditable spellCheck={false}>0 times</span>
                <span class={styles.sextext2}>this year</span>
            </div>
            <span class={styles.sexdesc + " " + styles.editable} contentEditable spellCheck={false}>You absolute fucking loser...</span>
            <div class={styles.sexstats}>
                <div class={styles.column}>
                    <span class={styles.sexminstext}>Minutes had sex</span>
                    <span class={styles.sexminsnum + " " + styles.editable} contentEditable spellCheck={false}>0</span>
                </div>
                <div class={styles.column}>
                    <span class={styles.sexminstext}>Partners</span>
                    <span class={styles.sexminsnum + " " + styles.editable} contentEditable spellCheck={false}>0</span>
                </div>
            </div>
        </div>
    </main>;
}
