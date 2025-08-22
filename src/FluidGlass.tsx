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
import ProjectsGallery3D from "./components/ProjectsGallery3D";
import SocialsComponent3D from "./components/SocialsComponent3D";

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
            // { label: "Connect", link: "" },
        ],
        ...modeProps
    } = rawOverrides;


    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
                <ScrollControls damping={0.2} pages={5} distance={0.4}>
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
            <SkillsCarousel3D position={[0, -11, 5]} speed={1} />

            <SectionTypography text="Projects" size="medium" position={[0, -12.3, 8]} />

            {/* 3D Projects Gallery with interactive cards */}
            <ProjectsGallery3D position={[0, -14, 6]} />

            <SectionTypography text="My Socials" size="medium" position={[0, -16.5, 8]} />

            {/* 3D Social Media Component */}
            <SocialsComponent3D position={[0, -18, 6]} />

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
        // "Connect": 0.95,
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
