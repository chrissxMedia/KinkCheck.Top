import { snapdom, type SnapdomOptions } from "@zumer/snapdom";

export default function ScreenshotButton({ title, options = {} }: { title: string, options?: SnapdomOptions }) {
    options.width ??= 1440;
    return (
        <>
            <a onClick={async () => {
                // TODO: be able to pass in a selector for what to screenshot
                const content = document.querySelector("div#content") as HTMLElement;
                document.body.classList.add("screenshot");
                content.style.width = options.width + "px";
                const filename = title + " " + new Date().toISOString().slice(0, 19).replace("T", " ") + ".png";
                await snapdom.download(content, {
                    format: "png",
                    type: "png",
                    backgroundColor: "#000",
                    scale: 2,
                    localFonts: [
                        {
                            family: "Unifont",
                            src: "https://fonts.chrissx.de/fonts/unifont-14.0.03.otf",
                        }
                    ],
                    embedFonts: true,
                    filename,
                    cache: "disabled",
                    ...options,
                });
                document.body.classList.remove("screenshot");
                content.style.width = "";
            }}>Take a Screenshot</a>
        </>
    );
}
