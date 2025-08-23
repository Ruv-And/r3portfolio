/* eslint-disable react/no-unknown-property */
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";

interface SocialPlatform {
    name: string;
    url: string;
    iconPath: string;
    color: string;
}

interface SocialsComponent3DProps {
    position?: [number, number, number];
    socials?: SocialPlatform[];
}

const defaultSocials: SocialPlatform[] = [
    {
        name: "GitHub",
        url: "https://github.com/Ruv-And",
        iconPath: "./assets/icons/github.png",
        color: "#333333"
    },
    {
        name: "LinkedIn",
        url: "https://linkedin.com/in/aruv-dand", 
        iconPath: "./assets/icons/linkedin.png",
        color: "#0077b5"
    }
];

export default function SocialsComponent3D({
    position = [0, -16, 6],
    socials = defaultSocials
}: SocialsComponent3DProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [hoveredSocial, setHoveredSocial] = useState<number | null>(null);

    // Simple horizontal layout for just 2 cards
    const getSocialPosition = (index: number): [number, number, number] => {
        const spacing = 1.5;
        const x = (index - 0.5) * spacing; // Center the two cards
        return [x, 0, 0];
    };

    return (
        <group ref={groupRef} position={position}>
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
            <RoundedBox args={[0.8, 0.8, 0.1]} radius={0.1}>
                <meshStandardMaterial
                    color={social.color}
                    transparent
                    opacity={0.9}
                />
            </RoundedBox>

            {/* Icon image */}
            <mesh position={[0, 0, 0.06]}>
                <planeGeometry args={[0.5, 0.5]} />
                <meshBasicMaterial
                    map={iconTexture}
                    transparent
                    opacity={1}
                />
            </mesh>
        </group>
    );
}
