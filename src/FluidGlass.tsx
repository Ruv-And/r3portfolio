/* eslint-disable react/no-unknown-property */
import * as THREE from "three";
import { useRef, useState, useEffect, memo } from "react";
import type { ReactNode } from 'react';
import {
    Canvas,
    createPortal,
    useFrame,
    useThree,
} from "@react-three/fiber";
import type { ThreeElements } from '@react-three/fiber';

import {
    useFBO,
    useGLTF,
    useScroll,
    Scroll,
    Preload,
    ScrollControls,
    MeshTransmissionMaterial,
    Text,
} from "@react-three/drei";

import { easing } from "maath";

//components
import SectionTypography from "./components/SectionTypography";
import Images from "./components/Images";
import ExperienceSection from "./components/ExperienceSection";
import SkillsCarousel3D from "./components/SkillsCarousel3D";

// Defines the mode types and props
type Mode = "lens" | "bar" | "cube";

interface NavItem {
    label: string;
    link: string;
}

type ModeProps = Record<string, unknown>;

interface FluidGlassProps {
    mode?: Mode;
    lensProps?: ModeProps;
    barProps?: ModeProps;
    cubeProps?: ModeProps;
}

// Main component that renders the entire scene based on selected mode
export default function FluidGlass({
    mode = "lens",
    lensProps = {},
    barProps = {},
    cubeProps = {},
}: FluidGlassProps) {
    const Wrapper = mode === "bar" ? Bar : mode === "cube" ? Cube : Lens;
    const rawOverrides =
        mode === "bar" ? barProps : mode === "cube" ? cubeProps : lensProps;

    const {
        navItems = [
            { label: "About Me", link: "" },
            { label: "Experience", link: "" },
            { label: "Skills", link: "" },
            { label: "Projects", link: "" },
        ],
        ...modeProps
    } = rawOverrides;


    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
                <ScrollControls damping={0.2} pages={4} distance={0.4}>
                    {mode === "bar" && <NavItems items={navItems as NavItem[]} />}
                    <Wrapper modeProps={modeProps}>
                        <SceneContent />
                        <Preload />
                    </Wrapper>
                    {/* Remove the ScrollAwareOverlay since we're using Html directly */}
                </ScrollControls>
            </Canvas>
        </div>
    );
}

// Scene content that has access to useThree hooks
function SceneContent() {
    
    return (
        <Scroll>
            {/* Add some lighting for 3D materials */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, 10]} intensity={0.5} />
            
            <SectionTypography text="Aruv Dand" size="large" position={[0, 0, 12]} />
            <SectionTypography text="About Me" size="medium" position={[0, -2, 8]} />
            <SectionTypography text={[
                "I'm an undergraduate student at the University",
                " of Illinois Urbana Champaign, pursuing a B.S. in",
                "Computer Science and a certificate in data science.",
                "I love finding problems and learning while trying to solve them."
            ]} size="small" position={[0, -2.4, 6]} />
            
            {/* University logo positioned to the right of the description */}
            
            <SectionTypography text="Experience" size="medium" position={[0, -5.8, 8]} />
            
            {/* 3D Experience Section with interactive buttons and cards */}
            <ExperienceSection position={[0, -7.2, 6]} />
            
            <SectionTypography text="Skills" size="medium" position={[0, -10, 8]} />
            <SkillsCarousel3D position={[0, -10.8, 6]} speed={0.5} />
            <SectionTypography text="Projects" size="medium" position={[0, -12, 8]} />
            <Images
                images={[
                    {
                        position: [-2, 0, 3],
                        scale: 3,
                        url: "assets/images/canada.jpg"
                    },
                    {
                        position: [2, 0, 3],
                        scale: 3,
                        url: "assets/images/golconda.png"
                    },
                    {
                        position: [0, -4.3, 6],
                        scale: [4,2],
                        url: "assets/images/uiuccampus.jpg"
                    },
                ]}
            />
            {/* Html overlay positioned below Typography and Images in world space */}
            {/* <Html position={[0, -8, 4]} center>
                <Sections />
            </Html> */}
        </Scroll>
    );
}

type MeshProps = ThreeElements["mesh"];

interface ModeWrapperProps extends MeshProps {
    children?: ReactNode;
    glb: string;
    geometryKey: string;
    lockToBottom?: boolean;
    followPointer?: boolean;
    modeProps?: ModeProps;
}


// Generic wrapper that loads GLTF model and handles animation, effects, and FBO rendering
const ModeWrapper = memo(function ModeWrapper({
    children,
    glb,
    geometryKey,
    lockToBottom = false,
    followPointer = true,
    modeProps = {},
    ...props
}: ModeWrapperProps) {
    const ref = useRef<THREE.Mesh>(null!);
    const { nodes } = useGLTF(glb);
    const buffer = useFBO();
    const { viewport: vp } = useThree();
    const [scene] = useState<THREE.Scene>(() => new THREE.Scene());
    const geoWidthRef = useRef<number>(1);

    useEffect(() => {
        const geo = (nodes[geometryKey] as THREE.Mesh)?.geometry;
        geo.computeBoundingBox();
        geoWidthRef.current = geo.boundingBox!.max.x - geo.boundingBox!.min.x || 1;
    }, [nodes, geometryKey]);

    useFrame((state, delta) => {
        const { gl, viewport, pointer, camera } = state;
        const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

        const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
        const destY = lockToBottom
            // ? -v.height / 2 + 0.2  // the bar is locked to the bottom
            ? v.height / 2 - 0.1  // the bar is locked to the top
            : followPointer
                ? (pointer.y * v.height) / 2
                : 0;
        easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

        if ((modeProps as { scale?: number }).scale == null) {
            const maxWorld = v.width * 0.9;
            const desired = maxWorld / geoWidthRef.current;
            ref.current.scale.setScalar(Math.min(0.15, desired));
        }

        gl.setRenderTarget(buffer);
        gl.render(scene, camera);
        gl.setRenderTarget(null);
        gl.setClearColor(0x5227ff, 1); // background color
    });

    const {
        scale,
        ior,
        thickness,
        anisotropy,
        chromaticAberration,
        ...extraMat
    } = modeProps as {
        scale?: number;
        ior?: number;
        thickness?: number;
        anisotropy?: number;
        chromaticAberration?: number;
        [key: string]: unknown;
    };

    return (
        <>
            {createPortal(children, scene)}
            <mesh scale={[vp.width, vp.height, 1]}>
                <planeGeometry />
                <meshBasicMaterial map={buffer.texture} transparent />
            </mesh>
            <mesh
                ref={ref}
                scale={scale ?? 0.15}
                rotation-x={Math.PI / 2}
                geometry={(nodes[geometryKey] as THREE.Mesh)?.geometry}
                {...props}
            >
                <MeshTransmissionMaterial
                    buffer={buffer.texture}
                    ior={ior ?? 1.15}
                    thickness={thickness ?? 5}
                    anisotropy={anisotropy ?? 0.01}
                    chromaticAberration={chromaticAberration ?? 0.1}
                    {...(typeof extraMat === "object" && extraMat !== null
                        ? extraMat
                        : {})}
                />
            </mesh>
        </>
    );
});

// Component variants that render different GLB shapes with wrapper props
function Lens({ modeProps, ...p }: { modeProps?: ModeProps } & MeshProps) {
    return (
        <ModeWrapper
            glb="/assets/3d/lens.glb"
            geometryKey="Cylinder"
            followPointer
            modeProps={modeProps}
            {...p}
        />
    );
}

function Cube({ modeProps, ...p }: { modeProps?: ModeProps } & MeshProps) {
    return (
        <ModeWrapper
            glb="/assets/3d/cube.glb"
            geometryKey="Cube"
            followPointer
            modeProps={modeProps}
            {...p}
        />
    );
}

function Bar({ modeProps = {}, ...p }: { modeProps?: ModeProps } & MeshProps) {
    const defaultMat = {
        transmission: 1,
        roughness: 0,
        thickness: 10,
        ior: 1.15,
        color: "#ffffff",
        attenuationColor: "#ffffff",
        attenuationDistance: 0.25,
    };

    return (
        <ModeWrapper
            glb="/assets/3d/bar.glb"
            geometryKey="Cube"
            lockToBottom
            followPointer={false}
            modeProps={{ ...defaultMat, ...modeProps }}
            {...p}
        />
    );
}

// Renders a set of interactive nav text items that stick to bottom of screen
function NavItems({ items }: { items: NavItem[] }) {
    const group = useRef<THREE.Group>(null!);
    const { viewport, camera } = useThree();
    const scroll = useScroll();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [clickedIndex, setClickedIndex] = useState<number | null>(null);

    // Map each nav item to a scroll offset (0 = top, 1 = bottom)
    // Adjust these offsets to match your SectionTypography positions/pages
    const sectionOffsets = {
        "About Me": 0.15,
        "Experience": 0.35,
        "Skills": 0.45,
        "Projects": 0.75,
    };

    const DEVICE = {
        mobile: { max: 639, spacing: 0.2, fontSize: 0.035 },
        tablet: { max: 1023, spacing: 0.24, fontSize: 0.045 },
        desktop: { max: Infinity, spacing: 0.3, fontSize: 0.045 },
    };
    const getDevice = () => {
        const w = window.innerWidth;
        return w <= DEVICE.mobile.max
            ? "mobile"
            : w <= DEVICE.tablet.max
                ? "tablet"
                : "desktop";
    };

    const [device, setDevice] = useState<keyof typeof DEVICE>(getDevice());

    useEffect(() => {
        const onResize = () => setDevice(getDevice());
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const { spacing, fontSize } = DEVICE[device];

    useFrame(() => {
        if (!group.current) return;
        const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
        // group.current.position.set(0, -v.height / 2 + 0.2, 15.1); // nav text position at bottom
        group.current.position.set(0, v.height / 2 - 0.112, 15.1); // nav text position at top

        group.current.children.forEach((child, i) => {
            child.position.x = (i - (items.length - 1) / 2) * spacing;
        });
    });

    // const handleNavigate = (link: string) => {
    const handleNavigate = (label: keyof typeof sectionOffsets, index: number) => {
        // if (!link) return;
        // link.startsWith("#")
        //     ? (window.location.hash = link)
        //     : (window.location.href = link);
        
        // Set clicked state for visual feedback
        setClickedIndex(index);
        setTimeout(() => setClickedIndex(null), 300); // Reset after 300ms
        
        const offset = sectionOffsets[label];
        if (offset !== undefined) {
            scroll.el.scrollTo({
                top: scroll.el.scrollHeight * offset,
                behavior: "smooth"
            });
        }
    };

    return (
        <group ref={group} renderOrder={10}>
            {items.map(({ label }, index) => {
                const isHovered = hoveredIndex === index;
                const isClicked = clickedIndex === index;
                
                return (
                    <Text
                        key={label}
                        fontSize={fontSize * (isHovered ? 1.01 : 1)} // Scale up on hover
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        font="/assets/fonts/figtreeblack.ttf"
                        outlineWidth={isClicked ? 0.015 : 0} // Add outline on click
                        outlineBlur={isClicked ? "30%" : "20%"} // Increase blur on click
                        outlineColor={isClicked ? "#5227ff" : "#000"} // Change outline color on click
                        outlineOpacity={isClicked ? 0.8 : 0.5}
                        renderOrder={10}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNavigate(label as keyof typeof sectionOffsets, index);
                        }}
                        onPointerOver={() => {
                            document.body.style.cursor = "pointer";
                            setHoveredIndex(index);
                        }}
                        onPointerOut={() => {
                            document.body.style.cursor = "auto";
                            setHoveredIndex(null);
                        }}
                    >
                        {label}
                    </Text>
                );
            })}
        </group>
    );
}


// Interactive experience tabs component with fade-in transitions
function ExperienceTabs() {
    const [activeTab, setActiveTab] = useState<number | null>(0); // Start with first tab selected
    const [fadeKey, setFadeKey] = useState(0); // Key to trigger re-animation

    const tabs = [
        {
            title: "Internship",
            content: {
                title: "Software Development Intern",
                company: "GEICO",
                duration: "June 2025 - Present",
                description: [
                    "Designed and built an internal Product Development Lifecycle (PDLC) orchestration platform using Figma, Django, GraphQL, PostgreSQL, and React to streamline developer workflows and accelerate project creation across a team of 3500+ engineers",
                    "Developed a REST API aligned with internal company procedures, incorporating Shift Left principles to reduce 27% of developer bottlenecks through earlier reviews, testing, and standardized processes",
                    "Integrated communication and automation features using Azure DevOps, Slack, and Office 365 APIs, enabling DevOps ticket generation and improving cross-team visibility",
                    "Implemented LLM-based risk categorization with Google Gemini API to proactively flag high-risk projects and enhance product creation planning"
                ]
            }
        },
        {
            title: "Research",
            content: {
                title: "Research Assistant",
                company: "University Lab",
                duration: "Fall 2023 - Present",
                description: [
                    "Conducted research on machine learning algorithms and data analysis",
                    "Published findings in academic conferences",
                    "Collaborated with graduate students on deep learning projects"
                ]
            }
        },
        {
            title: "Projects",
            content: {
                title: "Personal Projects",
                company: "Independent",
                duration: "2023 - Present",
                description: "Built various web applications and mobile apps using modern technologies. Focused on user experience and performance optimization."
            }
        }
    ];

    // Helper function to render description (string or bullet points)
    const renderDescription = (description: string | string[]) => {
        if (Array.isArray(description)) {
            return (
                <ul style={{ 
                    margin: "1rem 0 0 0", 
                    paddingLeft: "1.2rem",
                    lineHeight: "1.6",
                    fontSize: "0.95rem"
                }}>
                    {description.map((bullet, index) => (
                        <li key={index} style={{ marginBottom: "0.5rem" }}>
                            {bullet}
                        </li>
                    ))}
                </ul>
            );
        }
        return (
            <p style={{ 
                margin: "1rem 0 0 0", 
                lineHeight: "1.6",
                fontSize: "0.95rem"
            }}>
                {description}
            </p>
        );
    };

    // CSS animation keyframes and global fixes
    const fadeInStyle = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .html-wrapper {
            pointer-events: none !important;
        }
        
        .html-wrapper > * {
            pointer-events: auto;
        }
    `;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: fadeInStyle }} />
            <div
                style={{
                    display: "flex",
                    width: "60vw",
                    maxWidth: "1400px",
                    height: "300px",
                    fontFamily: "sans-serif",
                    gap: "0rem",
                    pointerEvents: "none", // Disable pointer events on container to allow scrolling
                }}
            >
                {/* Left side - Tabs */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        minWidth: "200px",
                        pointerEvents: "auto", // Enable pointer events only on the tabs container
                    }}
                >
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                const newTab = activeTab === index ? null : index;
                                setActiveTab(newTab);
                                if (newTab !== null) {
                                    setFadeKey(prev => prev + 1); // Trigger new animation
                                }
                            }}
                            style={{
                                padding: "1rem 1.5rem",
                                background: activeTab === index 
                                    ? "rgba(82, 39, 255, 0.8)" 
                                    : "rgba(40, 40, 60, 0.7)",
                                color: "#fff",
                                border: activeTab === index 
                                    ? "2px solid #5227ff" 
                                    : "2px solid transparent",
                                borderRadius: "12px",
                                cursor: "pointer",
                                fontSize: "1rem",
                                fontWeight: activeTab === index ? "600" : "400",
                                transition: "all 0.3s ease",
                                textAlign: "left",
                                boxShadow: activeTab === index 
                                    ? "0 4px 20px rgba(82, 39, 255, 0.3)" 
                                    : "0 2px 10px rgba(0, 0, 0, 0.2)",
                                transform: activeTab === index ? "translateX(5px)" : "translateX(0)",
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== index) {
                                    e.currentTarget.style.background = "rgba(60, 60, 80, 0.8)";
                                    e.currentTarget.style.transform = "translateX(3px)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== index) {
                                    e.currentTarget.style.background = "rgba(40, 40, 60, 0.7)";
                                    e.currentTarget.style.transform = "translateX(0)";
                                }
                            }}
                        >
                            {tab.title}
                        </button>
                    ))}
                </div>

                {/* Right side - Content */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "100%",
                        pointerEvents: "none", // Enable pointer events for content area
                    }}
                >
                    {activeTab !== null && (
                        <div
                            key={fadeKey} // Use key to force re-mount and re-animate
                            style={{
                                background: "rgba(40, 40, 60, 0.9)",
                                borderRadius: "16px",
                                padding: "2rem",
                                color: "#fff",
                                border: "2px solid #5227ff",
                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                                animation: "fadeIn 0.5s ease-in-out",
                                width: "100%",
                                maxWidth: "700px",
                                overflowY: "auto",
                            }}
                        >
                            <h3 style={{ 
                                margin: "0 0 0.5rem 0", 
                                color: "#5227ff",
                                fontSize: "1.5rem",
                                fontWeight: "600"
                            }}>
                                {tabs[activeTab].content.title}
                            </h3>
                            <p style={{ 
                                margin: "0 0 0.5rem 0", 
                                color: "#ccc",
                                fontSize: "1rem",
                                fontWeight: "500"
                            }}>
                                {tabs[activeTab].content.company} • {tabs[activeTab].content.duration}
                            </p>
                            {renderDescription(tabs[activeTab].content.description)}
                        </div>
                    )}
                    {activeTab === null && (
                        <div
                            style={{
                                color: "#999",
                                fontSize: "1.1rem",
                                textAlign: "center",
                                fontStyle: "italic",
                            }}
                        >
                            Select a tab to view details
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
