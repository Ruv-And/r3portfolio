import { useRef, useMemo, Suspense } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface SkillItem {
    name: string;
    iconPath: string;
    color?: string;
    url?: string;
}

interface SkillsCarousel3DProps {
    position?: [number, number, number];
    skills?: SkillItem[];
    speed?: number;
}

const defaultSkills: SkillItem[] = [
    // langs
    { name: "Java", iconPath: "./assets/skills/java.webp", color: "#ED8B00", url: "https://www.oracle.com/java/" },
    { name: "C++", iconPath: "./assets/skills/cpp.png", color: "#00599C", url: "https://isocpp.org/" },
    { name: "Python", iconPath: "./assets/skills/python.webp", color: "#3776AB", url: "https://www.python.org/" },
    { name: "TypeScript", iconPath: "./assets/skills/typescript.png", color: "#3178C6", url: "https://www.typescriptlang.org/" },
    { name: "JavaScript", iconPath: "./assets/skills/javascript.png", color: "#F7DF1E", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
    { name: "HTML", iconPath: "./assets/skills/html.png", color: "#E34F26", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
    { name: "CSS", iconPath: "./assets/skills/css.svg", color: "#1572B6", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
    { name: "SQL", iconPath: "./assets/skills/sql.png", color: "#336791", url: "https://www.w3schools.com/sql/" },
    // frameworks
    { name: "React", iconPath: "./assets/skills/react.png", color: "#61DAFB", url: "https://react.dev/" },
    { name: "Tailwind", iconPath: "./assets/skills/tailwind.png", color: "#06B6D4", url: "https://tailwindcss.com/" },
    { name: "Django", iconPath: "./assets/skills/django.svg", color: "#092E20", url: "https://www.djangoproject.com/" },
    { name: "Flask", iconPath: "./assets/skills/flask.webp", color: "#000000", url: "https://flask.palletsprojects.com/" },
    { name: "Node.js", iconPath: "./assets/skills/nodejs.png", color: "#339933", url: "https://nodejs.org/" },
    { name: "PostgreSQL", iconPath: "./assets/skills/postgresql.png", color: "#336791", url: "https://www.postgresql.org/" },
    { name: "GCP", iconPath: "./assets/skills/gcp.svg", color: "#4285F4", url: "https://cloud.google.com/" },
    { name: "Supabase", iconPath: "./assets/skills/supabase.png", color: "#3ECF8E", url: "https://supabase.com/" },
    // libs
    { name: "Jupyter", iconPath: "./assets/skills/jupyter.webp", color: "#F37626", url: "https://jupyter.org/" },
    { name: "Matplotlib", iconPath: "./assets/skills/matplotlib.png", color: "#11557C", url: "https://matplotlib.org/" },
    { name: "NumPy", iconPath: "./assets/skills/numpy.svg", color: "#013243", url: "https://numpy.org/" },
    { name: "Pandas", iconPath: "./assets/skills/pandas.svg", color: "#150458", url: "https://pandas.pydata.org/" },
    { name: "PyTorch", iconPath: "./assets/skills/pytorch.webp", color: "#EE4C2C", url: "https://pytorch.org/" },
    // tools
    { name: "Docker", iconPath: "./assets/skills/docker.png", color: "#2496ED", url: "https://www.docker.com/" },
    { name: "GitHub", iconPath: "./assets/skills/github.png", color: "#181717", url: "https://github.com/" },
    { name: "Android Studio", iconPath: "./assets/skills/android-studio.png", color: "#3DDC84", url: "https://developer.android.com/studio" },
    { name: "Tableau", iconPath: "./assets/skills/tableau.svg", color: "#E97627", url: "https://www.tableau.com/" },
    { name: "Ubuntu", iconPath: "./assets/skills/ubuntu.svg", color: "#E95420", url: "https://ubuntu.com/" },
    { name: "VS Code", iconPath: "./assets/skills/vscode.webp", color: "#007ACC", url: "https://code.visualstudio.com/" },
];

function SkillItem({
    skill,
    position
}: {
    skill: SkillItem;
    position: [number, number, number];
}) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const iconMeshRef = useRef<THREE.Mesh>(null!);
    
    // Load texture from local assets
    const texture = useLoader(THREE.TextureLoader, skill.iconPath);
    
    // Calculate aspect ratio preserving dimensions
    const baseSize = 0.6; // Base size for the shorter dimension
    const aspectRatio = texture.image.width / texture.image.height;
    const width = aspectRatio > 1 ? baseSize * aspectRatio : baseSize;
    const height = aspectRatio > 1 ? baseSize : baseSize / aspectRatio;

    const handleClick = () => {
        if (skill.url) {
            window.open(skill.url, '_blank', 'noopener,noreferrer');
        }
    };

    const handlePointerOver = () => {
        document.body.style.cursor = 'pointer';
        if (iconMeshRef.current) {
            iconMeshRef.current.scale.setScalar(1.05);
        }
    };

    const handlePointerOut = () => {
        document.body.style.cursor = 'auto';
        if (iconMeshRef.current) {
            iconMeshRef.current.scale.setScalar(1);
        }
    };

    return (
        <group position={position}>
            {/* Background with border */}
            <mesh ref={meshRef}>
                <boxGeometry args={[1, 1, 0.1]} />
                <meshBasicMaterial
                    color={skill.color || '#5227ff'}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Icon/texture on top with preserved aspect ratio */}
            <mesh 
                ref={iconMeshRef}
                position={[0, 0, 0.06]}
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial
                    map={texture}
                    transparent
                    opacity={0.9}
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
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
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
        <Suspense fallback={null}>
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
        </Suspense>
    );
}
