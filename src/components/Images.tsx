import * as THREE from "three";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, Image } from "@react-three/drei";

// Type definitions
interface ZoomMaterial extends THREE.Material {
    zoom: number;
}

interface ZoomMesh extends THREE.Mesh<THREE.BufferGeometry, ZoomMaterial> { }

type ZoomGroup = THREE.Group & { children: ZoomMesh[] };


interface ImageData {
    position: [number, number, number];
    scale: number | [number, number];
    url: string;
}

interface ImagesProps {
    images?: ImageData[];
}
export default function Images({ images }: ImagesProps = {}) {
    const group = useRef<ZoomGroup>(null!);
    const data = useScroll();
    const { height } = useThree((s) => s.viewport);

    // Default images if none provided
    const defaultImages: ImageData[] = [
        {
            position: [-2, 0, 0],
            scale: [3, height / 1.1],
            url: "https://images.unsplash.com/photo-1595001354022-29103be3b73a?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            position: [2, 0, 3],
            scale: 3,
            url: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            position: [-2.05, -height, 6],
            scale: [1, 3],
            url: "https://images.unsplash.com/photo-1513682121497-80211f36a7d3?q=80&w=3388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            position: [-0.6, -height, 9],
            scale: [1, 2],
            url: "https://images.unsplash.com/photo-1516205651411-aef33a44f7c2?q=80&w=2843&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            position: [0.75, -height, 10.5],
            scale: 1.5,
            url: "https://images.unsplash.com/photo-1505069190533-da1c9af13346?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
    ];

    const imageData = images || defaultImages;

    useFrame(() => {
        if (group.current?.children) {
            group.current.children.forEach((child, index) => {
                const mesh = child as THREE.Mesh;
                if (mesh.material && 'zoom' in mesh.material) {
                    // Apply zoom effects based on scroll position
                    if (index < 2) {
                        (mesh.material as ZoomMaterial).zoom = 1 + data.range(0, 1 / 3) / 3;
                    } else {
                        (mesh.material as ZoomMaterial).zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
                    }
                }
            });
        }
    });

    return (
        <group ref={group}>
            {imageData.map((image, index) => (
                <Image
                    key={index}
                    position={image.position}
                    scale={image.scale}
                    url={image.url}
                />
            ))}
        </group>
    );
}

// Export the types for use in other files
export type { ImageData, ImagesProps };
