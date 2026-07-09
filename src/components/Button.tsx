import type { ButtonHTMLAttributes } from "preact";
import styles from "./Button.module.css";

export default function Button(attr: ButtonHTMLAttributes & { label: string }) {
    return <button {...attr} class={styles.button}>{attr.label}</button>;
}
