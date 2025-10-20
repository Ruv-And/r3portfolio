/* eslint-disable react/no-unknown-property */
import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";

interface SocialPlatform {
    name: string;
    url: string;
    iconPath: string;
    color: string;
}

interface SocialsComponent3DProps {
    socials?: SocialPlatform[];
}

const defaultSocials: SocialPlatform[] = [
    {
        name: "GitHub",
        url: "https://github.com/Ruv-And",
        iconPath: "./assets/icons/github.png",
        color: "#ffffff"
    },
    {
        name: "LinkedIn",
        url: "https://linkedin.com/in/aruv-dand", 
        iconPath: "./assets/icons/linkedin.webp",
        color: "#0077b5"
    }
];

export default function SocialsComponent3D({
    socials = defaultSocials
}: SocialsComponent3DProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [hoveredSocial, setHoveredSocial] = useState<number | null>(null);
    const { viewport, camera } = useThree();

    // Responsive breakpoints for different screen sizes
    const DEVICE_BREAKPOINTS = {
        mobile: { max: 639, marginX: 0.2, marginY: 0.15, spacing: 0.2, scale: 0.8 },
        tablet: { max: 1023, marginX: 0.25, marginY: 0.17, spacing: 0.22, scale: 0.9 },
        desktop: { max: Infinity, marginX: 0.35, marginY: 0.17, spacing: 0.25, scale: 1.0 },
    };

    const getDeviceSettings = () => {
        const w = window.innerWidth;
        return w <= DEVICE_BREAKPOINTS.mobile.max
            ? DEVICE_BREAKPOINTS.mobile
            : w <= DEVICE_BREAKPOINTS.tablet.max
                ? DEVICE_BREAKPOINTS.tablet
                : DEVICE_BREAKPOINTS.desktop;
    };

    // Position the group in the bottom right corner of the screen responsively
    useFrame(() => {
        if (!groupRef.current) return;
        
        const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
        const deviceSettings = getDeviceSettings();
        
        // Use responsive margins based on screen size
        const marginX = deviceSettings.marginX;
        const marginY = deviceSettings.marginY;
        
        groupRef.current.position.set(
            v.width / 2 - marginX,
            -v.height / 2 + marginY,
            15.1 // Slightly in front of other elements
        );

        // Apply responsive scaling
        groupRef.current.scale.setScalar(deviceSettings.scale);
    });

    // Horizontal layout for the cards side by side with responsive spacing
    const getSocialPosition = (index: number): [number, number, number] => {
        const deviceSettings = getDeviceSettings();
        const spacing = deviceSettings.spacing; // Responsive spacing between cards
        const x = (index - (socials.length - 1) / 2) * spacing; // Center the cards horizontally
        return [x, 0, 0];
    };

    return (
        <group ref={groupRef} renderOrder={10}>
            {socials.map((social, index) => (
                <SocialCard
                    key={index}
                    social={social}
                    position={getSocialPosition(index)}
                    isHovered={hoveredSocial === index}
                    onHover={() => setHoveredSocial(index)}
                    onUnhover={() => setHoveredSocial(null)}
                />
            ))}
        </group>
    );
}

interface SocialCardProps {
    social: SocialPlatform;
    position: [number, number, number];
    isHovered: boolean;
    onHover: () => void;
    onUnhover: () => void;
}

function SocialCard({ social, position, isHovered, onHover, onUnhover }: SocialCardProps) {
    const cardRef = useRef<THREE.Group>(null);
    
    // Load the icon texture
    const iconTexture = useTexture(social.iconPath);

    useFrame((state, delta) => {
        if (cardRef.current) {
            // Scale animation on hover
            const targetScale = isHovered ? 1.1 : 1;
            cardRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
            
            // Gentle rotation left and right only when hovered
            if (isHovered) {
                cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
            } else {
                cardRef.current.rotation.y = THREE.MathUtils.lerp(cardRef.current.rotation.y, 0, delta * 4);
            }
        }
    });

    const handleClick = () => {
        window.open(social.url, '_blank', 'noopener,noreferrer');
    };

    return (
        <group
            ref={cardRef}
            position={position}
            onPointerOver={() => {
                onHover();
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
                onUnhover();
                document.body.style.cursor = 'auto';
            }}
            onClick={handleClick}
        >
            {/* Main card background */}
            <RoundedBox args={[0.2, 0.2, 0.04]} radius={0.04}>
                <meshBasicMaterial
                    color={social.color}
                    transparent={social.name !== "GitHub"}
                    opacity={social.name === "GitHub" ? 1.0 : 0.95}
                />
            </RoundedBox>

            {/* Icon image */}
            <mesh position={[0, 0, 0.025]}>
                <planeGeometry args={[0.18, 0.18]} />
                <meshBasicMaterial
                    map={iconTexture}
                    transparent
                    opacity={1.0}
                />
            </mesh>
        </group>
    );
}
