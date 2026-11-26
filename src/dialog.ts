export function showDialog(dialog: HTMLDialogElement, trigger: HTMLButtonElement) {
    document.body.append(dialog);
    dialog.addEventListener("close", () => {
        if (trigger.getClientRects().length) {
            trigger.focus();
        } else {
            document.querySelector<HTMLButtonElement>("#menu-toggle")?.focus();
        }
    }, { once: true });
    dialog.showModal();
}
