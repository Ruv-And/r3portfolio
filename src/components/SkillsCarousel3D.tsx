import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface SkillItem {
    name: string;
    color?: string;
}

interface SkillsCarousel3DProps {
    position?: [number, number, number];
    skills?: SkillItem[];
    speed?: number;
}

const defaultSkills: SkillItem[] = [
    { name: "React", color: "#61DAFB" },
    { name: "TypeScript", color: "#3178C6" },
    { name: "JavaScript", color: "#F7DF1E" },
    { name: "Python", color: "#3776AB" },
    { name: "Django", color: "#092E20" },
    { name: "Node.js", color: "#339933" },
    { name: "Three.js", color: "#000000" },
    { name: "PostgreSQL", color: "#336791" },
    { name: "GraphQL", color: "#E10098" },
    { name: "Docker", color: "#2496ED" },
    { name: "AWS", color: "#FF9900" },
    { name: "Git", color: "#F05032" },
];

function SkillItem({
    skill,
    position
}: {
    skill: SkillItem;
    position: [number, number, number];
}) {
    const meshRef = useRef<THREE.Mesh>(null!);

    return (
        <group position={position}>
            {/* Background with border */}
            <mesh ref={meshRef}>
                <boxGeometry args={[1, 1, 0.1]} />
                <meshBasicMaterial
                    color={skill.color || '#5227ff'}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Skill name text */}
            <Text
                position={[0, -0.7, 0.1]}
                fontSize={0.15}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.5}
                textAlign="center"
            >
                {skill.name}
            </Text>
        </group>
    );
}

export default function SkillsCarousel3D({
    position = [0, -10.8, 6],
    skills = defaultSkills,
    speed = 1
}: SkillsCarousel3DProps) {
    const groupRef = useRef<THREE.Group>(null!);

    // Create duplicated skills for seamless loop
    const duplicatedSkills = useMemo(() => {
        return [...skills, ...skills]; // Double for smooth infinite scroll
    }, [skills]);

    const spacing = 1.5; // Distance between skill items
    const totalWidth = skills.length * spacing;

    useFrame((_, delta) => {
        if (groupRef.current) {
            // Move the entire group to the left
            groupRef.current.position.x -= delta * speed * 1.0;

            // Reset position when first set has scrolled completely off screen
            if (groupRef.current.position.x <= -totalWidth) {
                groupRef.current.position.x = 0;
            }
        }
    });

    return (
        <group position={position}>
            {/* Background panel */}
            <mesh position={[0, 0, -0.2]}>
                <planeGeometry args={[12, 2]} />
                <meshBasicMaterial
                    color={new THREE.Color(0.08, 0.08, 0.12)}
                    transparent
                    opacity={0.6}
                />
            </mesh>

            {/* Scrolling skills group */}
            <group ref={groupRef}>
                {duplicatedSkills.map((skill, index) => (
                    <SkillItem
                        key={`${skill.name}-${index}`}
                        skill={skill}
                        position={[index * spacing - 6, 0, 0]} // Start from left side
                    />
                ))}
            </group>
        </group>
    );
}
