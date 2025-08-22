// 3D Experience Section with interactive buttons and animated cards
import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface ExperienceData {
    title: string;
    content: {
        title: string;
        company: string;
        duration: string;
        description: string[];
    };
}

interface ExperienceSectionProps {
    position?: [number, number, number];
}

export default function ExperienceSection({ position = [0, -6.5, 2] }: ExperienceSectionProps) {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [hoveredTab, setHoveredTab] = useState<number | null>(null);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    const [animationTrigger, setAnimationTrigger] = useState<number>(0);
    
    // Refs for animations
    const cardRef = useRef<THREE.Group>(null);
    const buttonsRef = useRef<THREE.Group>(null);
    
    const experienceData: ExperienceData[] = [
        {
            title: "GEICO",
            content: {
                title: "Software Development Intern",
                company: "GEICO",
                duration: "June 2025 - Present",
                description: [
                    "Designed and built an internal PDLC orchestration platform using Figma, Django, GraphQL, PostgreSQL, and React/TypeScript to streamline developer workflows and accelerate project creation across a team of 3500+ engineers.",
                    "Developed a REST API aligned with internal company procedures, incorporating Shift Left principles to reduce 27% of developer bottlenecks through earlier reviews, testing, and standardized processes.",
                    "Integrated communication and automation features using Azure DevOps, Slack, and Office 365 APIs, enabling DevOps ticket generation and improving cross-team visibility.",
                    "Implemented LLM-based risk categorization with Google Gemini API to proactively flag high-risk projects and enhance product creation planning."
                ]
            }
        },
        {
            title: "E42.ai",
            content: {
                title: "Software Intern",
                company: "E42.ai",
                duration: "June 2024 - August 2024",
                description: [
                    "Utilized the company's platform to configure virtual AI workers for automating human resource processes.",
                    "Tested the company’s generative AI model for accuracy using training documents and refined its responses.",
                    "Built an MLOps pipeline simulating natural language-to-SQL with LLMs; generated fake employee datasets (e.g. name, address, phone number, etc.) with Python/Faker, stored in MySQL, used ChromaDB for SQL retrieval, and ChatDB to convert query results into English answers."
                ]
            }
        },
        {
            title: "Bear Paddle",
            content: {
                title: "Swimming Instructor",
                company: "Bear Paddle Swim School",
                duration: "June 2021 – August 2021",
                description: [
                    "Taught life-saving swimming fundamentals to over 40 children aged 6 months to 13 years, promoting water safety and confidence in the pool.",
                    "Provided personalized instruction and managed the safety of multiple children simultaneously, ensuring a secure and supportive learning environment.",
                    "Effectively kept children engaged and entertained during lessons, contributing to improved customer retention and positive feedback from parents."
                ]
            }
        }
    ];

    // Animation loop
    useFrame((state) => {
        if (buttonsRef.current) {
            // Gentle rotation animation for button group
            buttonsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
        }
    });

    const handleTabClick = (index: number) => {
        if (index !== activeTab) {
            setIsTransitioning(true);
            // Start fade out
            setTimeout(() => {
                setActiveTab(index);
                setAnimationTrigger(prev => prev + 1); // Trigger animation
                // Allow new content to fade in
                setTimeout(() => {
                    setIsTransitioning(false);
                }, 100);
            }, 200);
        }
    };

    return (
        <group position={position}>
            {/* Tab Buttons */}
            <group ref={buttonsRef} position={[-2, 0, 0]}>
                {experienceData.map((item, index) => (
                    <TabButton
                        key={index}
                        title={item.title}
                        position={[0, -index * 0.7, 0]}
                        isActive={activeTab === index}
                        isHovered={hoveredTab === index}
                        onClick={() => handleTabClick(index)}
                        onHover={() => setHoveredTab(index)}
                        onUnhover={() => setHoveredTab(null)}
                    />
                ))}
            </group>

            {/* Content Card */}
            <group ref={cardRef} position={[1., -0.5, 0]}>
                <ContentCard
                    data={experienceData[activeTab].content}
                    isVisible={!isTransitioning}
                    isTransitioning={isTransitioning}
                    animationTrigger={animationTrigger}
                />
            </group>
        </group>
    );
}

// Individual Tab Button Component
interface TabButtonProps {
    title: string;
    position: [number, number, number];
    isActive: boolean;
    isHovered: boolean;
    onClick: () => void;
    onHover: () => void;
    onUnhover: () => void;
}

function TabButton({ title, position, isActive, isHovered, onClick, onHover, onUnhover }: TabButtonProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const scale = isActive ? 1.1 : isHovered ? 1.05 : 1;
    
    useFrame((_state, delta) => {
        if (meshRef.current) {
            // Smooth scale transition
            meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), delta * 8);
        }
    });

    return (
        <group position={position}>
            {/* Button Background */}
            <mesh
                ref={meshRef}
                onClick={onClick}
                onPointerOver={onHover}
                onPointerOut={onUnhover}
            >
                <boxGeometry args={[1.5, 0.5, 0.05]} />
                <meshStandardMaterial
                    color={isActive ? "#5227ff" : "#404060"}
                    transparent
                    opacity={0.8}
                    emissive={isActive ? "#5227ff" : "#000000"}
                    emissiveIntensity={isActive ? 0.2 : 0}
                />
            </mesh>
            
            {/* Button Text */}
            <Text
                position={[0, 0, 0.03]}
                fontSize={0.15}
                color="white"
                anchorX="center"
                anchorY="middle"
                font="/assets/fonts/figtreeblack.ttf"
                outlineWidth={0.005}
                outlineColor="#000"
                outlineOpacity={0.5}
            >
                {title}
            </Text>
        </group>
    );
}

// Content Card Component
interface ContentCardProps {
    data: ExperienceData['content'];
    isVisible: boolean;
    isTransitioning?: boolean;
    animationTrigger?: number;
}

function ContentCard({ data, isVisible, isTransitioning = false, animationTrigger = 0 }: ContentCardProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const textGroupRef = useRef<THREE.Group>(null);
    const [animationStartTime, setAnimationStartTime] = useState(0);
    
    // Reset animation ONLY when animationTrigger changes (i.e., on tab click)
    useEffect(() => {
        if (animationTrigger > 0) {
            setAnimationStartTime(Date.now());
        }
    }, [animationTrigger]); // Only animationTrigger as dependency
    
    // Calculate dynamic card height based on content
    const cardWidth = 3.5;
    const maxTextWidth = cardWidth - 0.4; // Text width with padding
    const fontSize = 0.08;
    const baseLineHeight = 0.2; // Base height for single line
    const characterWidth = fontSize * 0.3; // Approximate character width
    const charactersPerLine = Math.floor(maxTextWidth / characterWidth);
    
    // Calculate how many lines each description point will take
    const descriptionHeights = data.description.map(point => {
        const textLength = point.length + 2; // +2 for bullet and space
        const linesNeeded = Math.ceil(textLength / charactersPerLine);
        return linesNeeded * baseLineHeight;
    });
    
    // Calculate total height needed
    const baseHeight = 1; // Height for title, company, duration
    const totalDescriptionHeight = descriptionHeights.reduce((sum, height) => sum + height, 0);
    const padding = 0.4;
    const dynamicHeight = baseHeight + totalDescriptionHeight + padding;
    
    useFrame((_state, delta) => {
        if (meshRef.current) {
            // Card entrance animation with enhanced fade-in and bounce
            const targetScale = isVisible && !isTransitioning ? 1 : 0;
            const targetOpacity = isVisible && !isTransitioning ? 0.9 : 0;
            
            // Smooth scale transition with bounce effect
            const elapsed = (Date.now() - animationStartTime) / 1000;
            let scaleMultiplier = 1;
            
            if (isVisible && !isTransitioning && elapsed < 0.5) {
                // Add bounce effect during entrance
                const bounceProgress = elapsed / 0.5;
                scaleMultiplier = 1 + Math.sin(bounceProgress * Math.PI) * 0.1;
            }
            
            const finalScale = targetScale * scaleMultiplier;
            meshRef.current.scale.lerp(
                new THREE.Vector3(finalScale, finalScale, finalScale), 
                delta * 8
            );
            
            // Fade card background
            if (meshRef.current.material && 'opacity' in meshRef.current.material) {
                const material = meshRef.current.material as THREE.MeshStandardMaterial;
                material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, delta * 8);
            }
        }
        
        if (textGroupRef.current && isVisible && !isTransitioning) {
            // Enhanced text fade-in animation with staggered timing
            const elapsed = (Date.now() - animationStartTime) / 1000; // Convert to seconds
            
            textGroupRef.current.children.forEach((child, index) => {
                const text = child as THREE.Mesh;
                if (text.material && 'opacity' in text.material) {
                    const material = text.material as THREE.MeshBasicMaterial;
                    const delay = index * 0.15; // Increased delay for more dramatic effect
                    const animationDuration = 0.8; // Duration of fade-in
                    const progress = Math.max(0, Math.min(1, (elapsed - delay) / animationDuration));
                    
                    // Smooth easing function for better animation feel
                    const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
                    material.opacity = easedProgress;
                    
                    // Add slight scale animation to text with bounce
                    const baseScale = progress > 0 ? 1 : 0.8;
                    let textScale = baseScale;
                    
                    if (progress > 0 && progress < 1) {
                        // Add subtle bounce to text
                        textScale = baseScale + Math.sin(progress * Math.PI) * 0.05;
                    }
                    
                    text.scale.lerp(new THREE.Vector3(textScale, textScale, textScale), delta * 10);
                }
            });
        } else if (textGroupRef.current && (isTransitioning || !isVisible)) {
            // Fade out text quickly when transitioning
            textGroupRef.current.children.forEach((child) => {
                const text = child as THREE.Mesh;
                if (text.material && 'opacity' in text.material) {
                    const material = text.material as THREE.MeshBasicMaterial;
                    material.opacity = THREE.MathUtils.lerp(material.opacity, 0, delta * 40);
                }
            });
        }
    });

    return (
        <group>
            {/* Card Background - Dynamic size */}
            <mesh ref={meshRef}>
                <boxGeometry args={[cardWidth, dynamicHeight, 0.05]} />
                <meshStandardMaterial
                    color="#404060"
                    transparent
                    opacity={0.9}
                    emissive="#5227ff"
                    emissiveIntensity={0.05}
                />
            </mesh>
            
            {/* Card Content */}
            <group ref={textGroupRef} position={[0, 0, 0.03]}>
                {/* Title */}
                <Text
                    position={[0, (dynamicHeight / 2) - 0.3, 0]}
                    fontSize={0.18}
                    color="#5227ff"
                    anchorX="center"
                    anchorY="middle"
                    font="/assets/fonts/figtreeblack.ttf"
                    outlineWidth={0.005}
                    outlineColor="#000"
                    outlineOpacity={0.5}
                >
                    <meshBasicMaterial transparent opacity={0} />
                    {data.title}
                </Text>
                
                {/* Company and Duration */}
                <Text
                    position={[0, (dynamicHeight / 2) - 0.6, 0]}
                    fontSize={0.12}
                    color="#cccccc"
                    anchorX="center"
                    anchorY="middle"
                    font="/assets/fonts/figtreeblack.ttf"
                >
                    <meshBasicMaterial transparent opacity={0} />
                    {data.company} • {data.duration}
                </Text>
                
                {/* Description Points - Show all without truncation */}
                {data.description.map((point, index) => {
                    // Calculate cumulative position for this item
                    const previousHeights = descriptionHeights.slice(0, index).reduce((sum, height) => sum + height, 0);
                    const yPosition = (dynamicHeight / 2) - 1.0 - previousHeights;
                    
                    return (
                        <Text
                            key={index}
                            position={[-(cardWidth / 2) + 0.2, yPosition, 0]}
                            fontSize={0.08}
                            color="white"
                            anchorX="left"
                            anchorY="top"
                            font="/assets/fonts/figtreeblack.ttf"
                            maxWidth={cardWidth - 0.4}
                        >
                            <meshBasicMaterial transparent opacity={0} />
                            • {point}
                        </Text>
                    );
                })}
            </group>
        </group>
    );
}
