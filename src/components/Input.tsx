import { type StateUpdater } from "preact/hooks";

export default function Input({ error, placeholder, value, setValue, className }:
    { error?: string, placeholder: string, value: string, setValue: StateUpdater<string>, className?: string }) {
    return <div className={className}>
        <input type="text" spellcheck={false} autocorrect="false"
            placeholder={placeholder} value={value} onInput={(e) => setValue(e.target.value)} />
        {error && <span style={{ color: "red" }}>{error}</span>}
    </div>;
}
