import { actions } from "astro:actions";
import { useRef, useState } from "preact/hooks";
import Button from "./Button";

export default function SaveButton(props: { template_id: string; template_revision: string }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const [err, setErr] = useState<{ message: string }>();
    return (
        <>
            <a onClick={async () => {
                const saved = window.localStorage.getItem(props.template_id);
                if (!saved) {
                    setErr({ message: "Couldn't load check data" });
                    dialog.current?.showModal();
                    return;
                }

                const { data, error } = await actions.check.save({ ...props, data: JSON.parse(saved) });

                if (error) {
                    setErr(error);
                    dialog.current?.showModal();
                } else {
                    window.location.href = `/internal/checks/${data.id}`;
                }
            }}>
                Save
            </a>
            <dialog ref={dialog}
                style={{ backgroundColor: "black", border: "1px solid white", borderRadius: "0.5em" }}
                onClick={(event) => {
                    if (event.target === dialog.current && event.currentTarget === dialog.current) {
                        dialog.current.close();
                    }
                }}>
                <p style={{ fontFamily: "var(--sans-serif)", margin: 0 }}>
                    {err?.message}
                </p>
                <div style={{ display: "flex", flexDirection: "row-reverse", marginTop: "0.5em" }}>
                    <Button style={{ minWidth: "8ch" }} onClick={() => dialog.current?.close()} label="OK" />
                </div>
            </dialog>
        </>
    );
}
