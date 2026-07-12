function hash(str: string): string {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) + h) + str.charCodeAt(i);
    }
    return (h >>> 0).toString(36);
}

export default Object.assign(
    function gendarme(id: string, data: string | object): string {
        if (typeof data === "string") {
            const path = data.replace(/^file:\/\//, "").replace(/\?.*$/, "");
            return `_gendarme_${hash(path)}_${id}`;
        }
        throw new Error("gendarme called with data in frontmatter — did the Vite plugin run?");
    },
    {
        applyBind(gid: string, data: object): void {
            if (typeof document !== "undefined") {
                document.addEventListener("alpine:init", () => {
                    Alpine.bind(gid, () => data);
                });
            }
        }
    }
);
