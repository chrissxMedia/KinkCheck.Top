import html2canvas, { type Options } from "html2canvas";

export default function ScreenshotButton({ title, options = {} }: { title: string, options?: Partial<Options> }) {
    options.windowWidth ??= 1440;
    let download: HTMLAnchorElement;
    return (
        <>
            <a onClick={async () => {
                // TODO: be able to pass in a selector for what to screenshot
                // FIXME: currently this is kind of broken (header is not included)
                const content = document.querySelector("div#screenshotcontents") as HTMLElement;
                document.body.classList.add("screenshot");
                content.style.width = options.windowWidth + "px";
                const canvas = await html2canvas(content, {
                    backgroundColor: "black",
                    scrollX: 0,
                    scrollY: 0,
                    scale: window.orientation !== undefined ? 1 : 2,
                    ...options
                });
                document.body.classList.remove("screenshot");
                content.style.width = "";

                const date = new Date().toISOString()
                    .replace(/\....Z$/, "").replace("T", " ");
                download.setAttribute("download", `${title} ${date}.png`);
                download.setAttribute("href", canvas
                    .toDataURL("image/png")
                    .replace("image/png", "image/octet-stream"));
                // TODO: consider if it's empty to alert instead
                download.click();
            }}>Take a Screenshot</a>
            <a ref={x => download = x!} style="width:0;height:0" />
        </>
    );
}
