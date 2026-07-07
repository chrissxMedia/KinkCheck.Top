import type { ButtonHTMLAttributes, RefObject } from "preact";
import { useRef } from "preact/hooks";

function Button(attr: ButtonHTMLAttributes & { label: string }) {
    return <button {...attr} style={{
        border: 0,
        padding: "0.5em",
        borderRadius: "0.25em",
        margin: "0 0.5em",
        color: "white",
        backgroundColor: "#303030",
        ...(typeof attr.style === "object" ? attr.style : {})
    }}>{attr.label}</button>;
}

export default function ClearButton({ store }: { store: string }) {
    const dialog = useRef<HTMLDialogElement>(null);
    return (
        <>
            <a onClick={() => dialog.current?.showModal()}>Clear</a>
            <dialog ref={dialog}
                style={{ backgroundColor: "black", border: "1px solid white", borderRadius: "0.5em" }}
                onClick={(event) => {
                    if (event.target === dialog.current && event.currentTarget === dialog.current) {
                        dialog.current.close();
                    }
                }}>
                <p style={{ fontFamily: "var(--sans-serif)", margin: 0 }}>
                    Are you sure you want to clear your ratings? This action is irreversible.
                </p>
                <div style={{ display: "flex", flexDirection: "row-reverse", marginTop: "0.5em" }}>
                    <Button onClick={() => dialog.current?.close()} label="Cancel" />
                    <Button style={{ backgroundColor: "rgb(var(--cmred))" }} onClick={() => {
                        window.localStorage.removeItem(store);
                        window.location.reload();
                    }} label="Clear" />
                </div>
            </dialog>
        </>
    );
}
