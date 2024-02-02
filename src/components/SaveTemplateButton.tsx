import { useState } from "preact/hooks";
import { encodeKinkCheck, type TemplateRevision, type ratings } from "../base";
import { ratingstore } from "../kcstore";
import { useStore } from "@nanostores/preact";

export default function SaveTemplateButton(meta: TemplateRevision) {
    const ratings = useStore(ratingstore)!;
    const [lastSaved, setLastSaved] = useState<ratings>([]);

    async function saveTemplate(e: Event) {
        e.preventDefault();
        const body = new FormData();
        body.append("template", meta.id);
        body.append("version", meta.version);
        body.append("data", JSON.stringify(encodeKinkCheck(meta, { ratings })));
        const resp = await fetch("/api/check/revision/create", { method: "post", body });
        if (resp.status) setLastSaved(ratings);
        alert(await resp.text());
    }

    // this doesn't actually compare the content, but that is fine rn
    const text = lastSaved === ratings ? "Saved ✅" : "Save";
    return <button type="submit" onClick={saveTemplate}>{text}</button>;
}
