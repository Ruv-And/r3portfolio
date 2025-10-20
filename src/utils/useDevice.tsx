import { useEffect, useState } from "react";

type Device = "mobile" | "tablet" | "desktop";

/**
 * Simple hook to determine device category using window.innerWidth and matchMedia as fallback.
 * Returns the device string and a boolean `isMobile` for convenience.
 */
export default function useDevice() {
    const getDevice = (): Device => {
        if (typeof window === "undefined") return "desktop";
        const w = window.innerWidth;
        return w <= 639 ? "mobile" : w <= 1023 ? "tablet" : "desktop";
    };

    const [device, setDevice] = useState<Device>(getDevice());

    useEffect(() => {
        const onResize = () => {
            const next = getDevice();
            setDevice((prev) => (prev === next ? prev : next));
        };

        window.addEventListener("resize", onResize);
        // also listen to orientationchange for some mobile browsers
        window.addEventListener("orientationchange", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("orientationchange", onResize);
        };
    }, []);

    return {
        device,
        isMobile: device === "mobile",
        isTablet: device === "tablet",
        isDesktop: device === "desktop",
    } as const;
}
