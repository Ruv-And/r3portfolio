/* eslint-disable react/no-unknown-property */
import { useRef, useState, Suspense, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

interface ProjectData {
    title: string;
    description: string;
    technologies: string[];
    imageUrl: string;
    githubUrl?: string;
    liveUrl?: string;
    featured?: boolean;
}

interface ProjectsGallery3DProps {
    position?: [number, number, number];
    projects?: ProjectData[];
}

const defaultProjects: ProjectData[] = [
    {
        title: "Snipiddy",
        description: "Sign in and enter your dietary restrictions, such as food allergies or irritating ingredients, along with any diets or price restrictions. Then, snap a photo of your menu and let an AI-powered scanner take over. Within seconds, it identifies potential allergens and offers dietary recommendations tailored to your needs, helping you make confident, informed food choices!",
        technologies: ["Typescript", "SQL", "NextJS", "Tailwind", "PostgreSQL"],
        imageUrl: "/assets/projects/snippidy.png",
        // githubUrl: "https://github.com/yourusername/pdlc-platform",
        // liveUrl: "https://internal-pdlc.geico.com",
        featured: false,
    },
    {
        title: "Mileage Masters",
        description: "My team's entry for the Business Professionals of America 2023 Website Design Team competition. A used car marketplace with cross-platform functionality, advanced payment calculators, and a contact form. This earned us first place nationally.",
        technologies: ["JavaScript", "Bootstrap", "HTML", "CSS", "Sass", "PHPMailer"],
        imageUrl: "/assets/projects/mileagemasters.png",
        // githubUrl: "https://github.com/yourusername/nl-to-sql-pipeline",
        featured: false,
    },
    {
        title: "QLearning Snake Agent",
        description: "An agent trained using Q-Learning with Temporal Difference to learn how to play the classic Snake game. Also allows the user to customize the training parameters and play the game themselves.",
        technologies: ["Python", "Numpy"],
        imageUrl: "/assets/projects/snake.png",
        // githubUrl: "https://github.com/yourusername/r3portfolio",
        // liveUrl: "https://aruv-portfolio.com",
        featured: false,
    }
];

export default function ProjectsGallery3D({
    position = [0, -13, 6],
    projects = defaultProjects
}: ProjectsGallery3DProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [hoveredProject, setHoveredProject] = useState<number | null>(null);

    // Calculate positions for projects in a staggered layout
    const getProjectPosition = (index: number): [number, number, number] => {
        const centerOffset = (projects.length - 1) * 0.5;
        const x = (index - centerOffset) * 2.8; // Spacing between cards
        const y = index % 2 === 0 ? 0 : -0.3; // Alternate heights for visual interest
        const z = projects[index]?.featured ? 0.2 : 0; // Featured projects slightly forward
        return [x, y, z];
    };

    useFrame((state) => {
        if (groupRef.current) {
            // Gentle floating animation
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;

            // Subtle rotation based on mouse position
            const mouse = state.pointer;
            groupRef.current.rotation.y = mouse.x * 0.02;
            groupRef.current.rotation.x = mouse.y * 0.01;
        }
    });

    return (
        <Suspense fallback={null}>
            <group ref={groupRef} position={position}>
                {/* Background panel with glass effect */}
                <mesh position={[0, 0, -0.5]}>
                    <planeGeometry args={[projects.length * 3, 4]} />
                    <meshBasicMaterial
                        color={new THREE.Color(0.08, 0.08, 0.15)}
                        transparent
                        opacity={0.3}
                    />
                </mesh>

                {projects.map((project, index) => (
                    <ProjectCard
                        key={index}
                        project={project}
                        position={getProjectPosition(index)}
                        isHovered={hoveredProject === index}
                        onHover={() => setHoveredProject(index)}
                        onUnhover={() => setHoveredProject(null)}
                    />
                ))}
            </group>
        </Suspense>
    );
}

interface ProjectCardProps {
    project: ProjectData;
    position: [number, number, number];
    isHovered: boolean;
    onHover: () => void;
    onUnhover: () => void;
}

function ProjectCard({ project, position, isHovered, onHover, onUnhover }: ProjectCardProps) {
    const cardRef = useRef<THREE.Group>(null);
    const imageRef = useRef<THREE.Mesh>(null);
    const [imageTexture, setImageTexture] = useState<THREE.Texture | null>(null);
    const [imageError, setImageError] = useState<boolean>(false);
    const [imageAspectRatio, setImageAspectRatio] = useState<number>(16/9); // Default aspect ratio

    // Calculate dynamic card height based on content
    const cardWidth = 2;
    const maxTextWidth = cardWidth - 0.4; // Text width with padding
    const fontSize = 0.07;
    const characterWidth = fontSize * 0.4; // Approximate character width
    const charactersPerLine = Math.floor(maxTextWidth / characterWidth);
    
    // Calculate description height
    const descriptionLines = Math.ceil(project.description.length / charactersPerLine);
    const descriptionHeight = descriptionLines * 0.15; // Line height for description
    
    // Calculate technology tags height (3 per row)
    const techRows = Math.ceil(project.technologies.length / 3);
    const techHeight = techRows * 0.25;
    
    // Calculate total height needed
    const baseHeight = 1.5; // Height for image, title
    const dynamicHeight = Math.max(2.7, baseHeight + descriptionHeight + techHeight + 0.0); // Reduced padding from 0.8 to 0.5

    // Calculate image dimensions maintaining aspect ratio
    const maxImageWidth = 1.7;
    const maxImageHeight = 0.9;
    let imageWidth = maxImageWidth;
    let imageHeight = maxImageHeight;

    // Adjust dimensions to maintain aspect ratio
    if (imageAspectRatio > maxImageWidth / maxImageHeight) {
        // Image is wider - fit to width
        imageHeight = maxImageWidth / imageAspectRatio;
    } else {
        // Image is taller - fit to height
        imageWidth = maxImageHeight * imageAspectRatio;
    }

    // Load actual image texture
    const texture = useMemo(() => {
        const loader = new THREE.TextureLoader();
        
        // Try to load the actual image first
        if (project.imageUrl && !imageError) {
            loader.load(
                project.imageUrl,
                (loadedTexture) => {
                    loadedTexture.flipY = true;
                    // Improve image quality with better filtering
                    loadedTexture.magFilter = THREE.LinearFilter;
                    loadedTexture.minFilter = THREE.LinearMipMapLinearFilter;
                    loadedTexture.anisotropy = 16; // Maximum anisotropy for crisp images
                    loadedTexture.generateMipmaps = true;
                    
                    // Calculate and set aspect ratio from the loaded image
                    const img = loadedTexture.image;
                    if (img && img.width && img.height) {
                        setImageAspectRatio(img.width / img.height);
                    }
                    
                    setImageTexture(loadedTexture);
                },
                undefined,
                (error) => {
                    console.warn(`Failed to load image: ${project.imageUrl}`, error);
                    setImageError(true);
                }
            );
        }

        // Create fallback canvas texture with higher resolution
        const canvas = document.createElement('canvas');
        canvas.width = 1024; // Increased from 512 for better quality
        canvas.height = 512; // Increased from 256 for better quality
        const ctx = canvas.getContext('2d')!;

        // Create gradient based on project type
        const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
        if (project.featured) {
            gradient.addColorStop(0, '#5227ff');
            gradient.addColorStop(1, '#8b5cf6');
        } else {
            gradient.addColorStop(0, '#404060');
            gradient.addColorStop(1, '#606080');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);

        // Add project title with higher resolution
        ctx.fillStyle = 'white';
        ctx.font = 'bold 56px Arial'; // Doubled font size for higher resolution
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8; // Increased shadow blur
        ctx.fillText(project.title, 512, 280);

        // Add tech stack indicator with higher resolution
        ctx.font = '32px Arial'; // Doubled font size
        ctx.fillStyle = '#cccccc';
        ctx.fillText(project.technologies.slice(0, 3).join(' • '), 512, 360);

        const canvasTexture = new THREE.CanvasTexture(canvas);
        canvasTexture.needsUpdate = true;
        // Apply same quality settings to canvas texture
        canvasTexture.magFilter = THREE.LinearFilter;
        canvasTexture.minFilter = THREE.LinearMipMapLinearFilter;
        canvasTexture.generateMipmaps = true;
        return canvasTexture;
    }, [project.title, project.featured, project.technologies, project.imageUrl, imageError]);

    useFrame((state, delta) => {
        if (cardRef.current) {
            // Scale animation on hover
            const targetScale = isHovered ? 1.05 : project.featured ? 1.02 : 1;
            cardRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);

            // Subtle floating animation
            const floatY = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.02;
            cardRef.current.position.y = position[1] + floatY;

            // Rotation on hover
            const targetRotationY = isHovered ? Math.sin(state.clock.elapsedTime * 3) * 0.1 : 0;
            cardRef.current.rotation.y = THREE.MathUtils.lerp(cardRef.current.rotation.y, targetRotationY, delta * 4);
        }

        if (imageRef.current) {
            // Image brightness on hover
            const material = imageRef.current.material as THREE.MeshBasicMaterial;
            const targetOpacity = isHovered ? 0.9 : 0.8;
            material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, delta * 6);
        }
    });

    const handleCardClick = () => {
        if (project.liveUrl) {
            window.open(project.liveUrl, '_blank', 'noopener,noreferrer');
        } else if (project.githubUrl) {
            window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleGithubClick = (e: Event) => {
        e.stopPropagation();
        if (project.githubUrl) {
            window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <group
            ref={cardRef}
            position={position}
            onPointerOver={onHover}
            onPointerOut={onUnhover}
        >
            {/* Main card background - Dynamic height */}
            <RoundedBox args={[2, dynamicHeight, 0.1]} radius={0.08} onClick={handleCardClick}>
                <meshStandardMaterial
                    color="#404060"
                    transparent
                    opacity={0.9}
                    emissive="#5227ff"
                    emissiveIntensity={isHovered ? 0.1 : 0.03}
                />
            </RoundedBox>

            {/* Project image */}
            <mesh
                ref={imageRef}
                position={[0, (dynamicHeight / 2) - 0.7, 0.06]}
                onClick={handleCardClick}
            >
                <planeGeometry args={[imageWidth, imageHeight]} />
                <meshBasicMaterial
                    map={imageTexture || texture}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Featured badge */}
            {project.featured && (
                <RoundedBox position={[0.7, (dynamicHeight / 2) - 0.2, 0.07]} args={[0.4, 0.15, 0.02]} radius={0.02}>
                    <meshBasicMaterial color="#ffaa00" />
                </RoundedBox>
            )}

            {project.featured && (
                <Text
                    position={[0.7, (dynamicHeight / 2) - 0.2, 0.09]}
                    fontSize={0.06}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    font="/assets/fonts/figtreeblack.ttf"
                    outlineWidth={0.002}
                    outlineColor="#000"
                    outlineOpacity={0.4}
                >
                    FEATURED
                </Text>
            )}

            {/* Project title */}
            <Text
                position={[0, (dynamicHeight / 2) - 1.3, 0.08]}
                fontSize={0.12}
                color="#5227ff"
                anchorX="center"
                anchorY="middle"
                font="/assets/fonts/figtreeblack.ttf"
                maxWidth={1.8}
                textAlign="center"
                outlineWidth={0.003}
                outlineColor="#000"
                outlineOpacity={0.5}
            >
                {project.title}
            </Text>

            {/* Project description - Full text with wrapping */}
            <Text
                position={[0, (dynamicHeight / 2) - 1.45, 0.08]}
                fontSize={0.07}
                color="white"
                anchorX="center"
                anchorY="top"
                font="/assets/fonts/figtreeblack.ttf"
                maxWidth={1.8}
                textAlign="center"
                lineHeight={1.2}
                outlineWidth={0.002}
                outlineColor="#000"
                outlineOpacity={0.3}
            >
                {project.description}
            </Text>

            {/* Technologies tags - Multi-line support */}
            <group position={[0, (dynamicHeight / 2) - 1.5 - descriptionHeight , 0.12]}>
                {project.technologies.map((tech, techIndex) => {
                    // Calculate position for multi-line layout
                    const tagsPerLine = 3;
                    const row = Math.floor(techIndex / tagsPerLine);
                    const col = techIndex % tagsPerLine;
                    const xOffset = (col - (Math.min(tagsPerLine, project.technologies.length - row * tagsPerLine) - 1) / 2) * 0.6;
                    const yOffset = -row * 0.25; // Spacing between rows
                    
                    return (
                        <group key={techIndex} position={[xOffset, yOffset, 0]}>
                            <RoundedBox args={[0.5, 0.15, 0.02]} radius={0.02}>
                                <meshBasicMaterial
                                    color="#5227ff"
                                    transparent
                                    opacity={0.7}
                                />
                            </RoundedBox>
                            <Text
                                position={[0, 0, 0.02]}
                                fontSize={0.05}
                                color="white"
                                anchorX="center"
                                anchorY="middle"
                                font="/assets/fonts/figtreeblack.ttf"
                                outlineWidth={0.002}
                                outlineColor="#000"
                                outlineOpacity={0.3}
                            >
                                {tech}
                            </Text>
                        </group>
                    );
                })}
            </group>

            {/* Action buttons */}
            {project.githubUrl && (
                <RoundedBox
                    position={[-0.4, -(dynamicHeight / 2) + 0.3, 0.06]}
                    args={[0.3, 0.12, 0.02]}
                    radius={0.02}
                    onClick={handleGithubClick}
                    onPointerOver={() => {
                        document.body.style.cursor = 'pointer';
                    }}
                    onPointerOut={() => {
                        document.body.style.cursor = 'auto';
                    }}
                >
                    <meshBasicMaterial color="#333333" />
                </RoundedBox>
            )}

            {project.githubUrl && (
                <Text
                    position={[-0.4, -(dynamicHeight / 2) + 0.3, 0.09]}
                    fontSize={0.05}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    font="/assets/fonts/figtreeblack.ttf"
                    onClick={handleGithubClick}
                    outlineWidth={0.002}
                    outlineColor="#000"
                    outlineOpacity={0.3}
                >
                    GitHub
                </Text>
            )}

            {project.liveUrl && (
                <RoundedBox position={[0.4, -(dynamicHeight / 2) + 0.3, 0.07]} args={[0.3, 0.12, 0.02]} radius={0.02}>
                    <meshBasicMaterial color="#00aa00" />
                </RoundedBox>
            )}

            {project.liveUrl && (
                <Text
                    position={[0.4, -(dynamicHeight / 2) + 0.3, 0.09]}
                    fontSize={0.05}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    font="/assets/fonts/figtreeblack.ttf"
                    outlineWidth={0.002}
                    outlineColor="#000"
                    outlineOpacity={0.3}
                >
                    Live
                </Text>
            )}
        </group>
    );
}
