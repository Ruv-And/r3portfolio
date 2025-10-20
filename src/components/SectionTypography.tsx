// Displays the user's name in stylized 3D text
// SectionTypography: Flexible 3D text component for headings and sections

import useDevice from "../utils/useDevice";
import { Text } from "@react-three/drei";

interface SectionTypographyProps {
    text: string | string[];
    position?: [number, number, number];
    size?: "small" | "medium" | "large";
    color?: string;
}



export default function SectionTypography({
    text,
    position = [0, 0, 12],
    size = "large",
    color = "white",
}: SectionTypographyProps) {
    // Device-based font sizes for each size option
    const DEVICE = {
        small: { mobile: 0.07, tablet: 0.12, desktop: 0.19 },
        medium: { mobile: 0.13, tablet: 0.22, desktop: 0.35 },
        large: { mobile: 0.2, tablet: 0.4, desktop: 0.7 },
    };
    
    const { device, isMobile } = useDevice();
    // Slightly reduce font sizes on mobile for denser layouts
    const mobileScale = isMobile ? 0.85 : 1;
    const fontSize = DEVICE[size][device as "mobile" | "tablet" | "desktop"] * mobileScale;

    // Device-aware position offsets so we can move headers on mobile
    const POSITION_OFFSETS: Record<string, [number, number, number]> = {
        mobile: [0, -0.4, 10],
        tablet: [0, -0.2, 11],
        desktop: [0, 0, 12],
    };

    const basePos = POSITION_OFFSETS[device as "mobile" | "tablet" | "desktop"] || position;
    // Merge provided position with the base per-device position (prefer explicit prop when provided)
    const usedPosition: [number, number, number] = [
        position?.[0] ?? basePos[0],
        position?.[1] ?? basePos[1],
        position?.[2] ?? basePos[2],
    ];
    
    // If text is an array, render each line as a separate Text component for individual centering
    if (Array.isArray(text)) {
        return (
            <>
                {text.map((line, index) => (
                    <Text
                        key={index}
                        position={[usedPosition[0], usedPosition[1] - (index * fontSize * 1.2), usedPosition[2]]}
                        font="./assets/fonts/figtreeblack.ttf"
                        fontSize={fontSize}
                        letterSpacing={-0.05}
                        outlineWidth={0}
                        outlineBlur="20%"
                        outlineColor="#000"
                        outlineOpacity={0.7}
                        color={color}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {line}
                    </Text>
                ))}
            </>
        );
    }
    
    // Single line text
    return (
        <Text
            position={usedPosition}
            font="./assets/fonts/figtreeblack.ttf"
            fontSize={fontSize}
            letterSpacing={-0.05}
            outlineWidth={0}
            outlineBlur="20%"
            outlineColor="#000"
            outlineOpacity={0.7}
            color={color}
            anchorX="center"
            anchorY="middle"
        >
            {text}
        </Text>
    );
}
