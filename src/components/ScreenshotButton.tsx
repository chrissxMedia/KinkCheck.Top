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
                const scale = window.orientation !== undefined ? 1 : 2;
                const filename = title + " " + new Date().toISOString().replace(/\....Z$/, "").replace("T", " ") + ".png";
                await snapdom.download(content, {
                    backgroundColor: "#000",
                    width: options.width ? options.width * scale : undefined,
                    height: options.height ? options.height * scale : undefined,
                    localFonts: [
                        {
                            family: "Unifont",
                            src: "https://fonts.chrissx.de/fonts/unifont-14.0.03.otf",
                        }
                    ],
                    safariWarmupAttempts: 100,
                    //embedFonts: true,
                    //iconFonts: [
                    //    "Unifont"
                    //],
                    filename,
                    cache: "disabled",
                    ...options,
                });
                document.body.classList.remove("screenshot");
                content.style.width = "";

                // TODO: consider if it's empty to alert instead
            }}>Take a Screenshot</a>
        </>
    );
}
