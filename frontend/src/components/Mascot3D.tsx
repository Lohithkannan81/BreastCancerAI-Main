import React from 'react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';
import mascotNormal from '../assets/mascot_normal.png';
import mascotHiding from '../assets/mascot_hiding.png';

interface Mascot3DProps {
    isEmailFocused: boolean;
    isPasswordFocused: boolean;
    isPasswordVisible: boolean;
    mouseX: number;
    mouseY: number;
}

const Mascot3D: React.FC<Mascot3DProps> = ({
    isEmailFocused,
    isPasswordFocused,
    isPasswordVisible,
    mouseX,
    mouseY,
}) => {
    const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };

    // Parallax movement for the whole group
    const groupX = useSpring(useMotionValue(0), springConfig);
    const groupY = useSpring(useMotionValue(0), springConfig);

    // Pupil tracking
    const pX = useSpring(useMotionValue(0), springConfig);
    const pY = useSpring(useMotionValue(0), springConfig);

    React.useEffect(() => {
        // Parallax: Move slightly in opposite direction of mouse
        groupX.set(mouseX * -15);
        groupY.set(mouseY * -10);

        // Eyes: Focus on inputs or track cursor
        if (isEmailFocused) {
            pX.set(-5);
            pY.set(12);
        } else if (isPasswordFocused && !isPasswordVisible) {
            pX.set(15);
            pY.set(-5);
        } else {
            pX.set(mouseX * 12);
            pY.set(mouseY * 10);
        }
    }, [mouseX, mouseY, isEmailFocused, isPasswordFocused, isPasswordVisible, groupX, groupY, pX, pY]);

    const isHiding = isPasswordVisible;

    // Render pupils for the three mascots
    const MascotPupils = ({ index }: { index: number }) => {
        // Approximate positions for the pupils of the three mascots in the render
        const positions = [
            { lx: 28, ly: 45, rx: 34, ry: 45 }, // Left mascot
            { lx: 47, ly: 42, rx: 53, ry: 42 }, // Middle mascot
            { lx: 66, ly: 45, rx: 72, ry: 45 }, // Right mascot
        ];
        const pos = positions[index];

        return (
            <motion.g
                animate={{ opacity: isHiding ? 0 : 0.8 }}
                transition={{ duration: 0.2 }}
            >
                {/* Left Eye Pupil */}
                <motion.circle
                    cx={`${pos.lx}%`}
                    cy={`${pos.ly}%`}
                    r="1.2"
                    fill="#1a1a1a"
                    style={{ x: pX, y: pY }}
                />
                {/* Shine */}
                <motion.circle
                    cx={`${pos.lx - 0.5}%`}
                    cy={`${pos.ly - 0.5}%`}
                    r="0.4"
                    fill="white"
                    style={{ x: useTransform(pX, v => v * 1.1), y: useTransform(pY, v => v * 1.1) }}
                />

                {/* Right Eye Pupil */}
                <motion.circle
                    cx={`${pos.rx}%`}
                    cy={`${pos.ry}%`}
                    r="1.2"
                    fill="#1a1a1a"
                    style={{ x: pX, y: pY }}
                />
                {/* Shine */}
                <motion.circle
                    cx={`${pos.rx - 0.5}%`}
                    cy={`${pos.ry - 0.5}%`}
                    r="0.4"
                    fill="white"
                    style={{ x: useTransform(pX, v => v * 1.1), y: useTransform(pY, v => v * 1.1) }}
                />
            </motion.g>
        );
    };

    return (
        <div className="relative w-64 h-64 mx-auto select-none pointer-events-none">
            <AnimatePresence mode="wait">
                <motion.div
                    key={isHiding ? 'hiding' : 'normal'}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        x: groupX,
                        y: groupY,
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full relative"
                    style={{ perspective: 1000 }}
                >
                    {/* Main 3D Render Image with Breathing animation */}
                    <motion.img
                        src={isHiding ? mascotHiding : mascotNormal}
                        alt="Mascot Group"
                        className="w-full h-full object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.4)]"
                        animate={{
                            scale: [1, 1.02, 1],
                            rotate: [0, 1, 0, -1, 0]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 5,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Dynamic Interaction Layer */}
                    <svg
                        viewBox="0 0 100 100"
                        className="absolute inset-0 w-full h-full overflow-visible"
                    >
                        {/* Pupil Overlays */}
                        {!isHiding && [0, 1, 2].map(i => <MascotPupils key={i} index={i} />)}

                        {/* Blinking Simulation (transparent occlusion layer) */}
                        {!isHiding && (
                            <motion.g
                                animate={{ scaleY: [0, 0, 1, 0, 0] }}
                                transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.95, 1] }}
                                style={{ originY: "45%" }}
                                className="opacity-20"
                            >
                                {/* Left blink */}
                                <ellipse cx="31%" cy="45%" rx="4%" ry="4%" fill="#4a5568" />
                                {/* Middle blink */}
                                <ellipse cx="50%" cy="42%" rx="4%" ry="4%" fill="#4a5568" />
                                {/* Right blink */}
                                <ellipse cx="69%" cy="45%" rx="4%" ry="4%" fill="#4a5568" />
                            </motion.g>
                        )}
                    </svg>
                </motion.div>
            </AnimatePresence>

            {/* Deep Ground Shadow with dynamic scaling */}
            <motion.div
                animate={{
                    scale: [1, 0.85, 1],
                    opacity: [0.3, 0.15, 0.3],
                    x: useTransform(groupX, v => v * 0.5)
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-6 bg-black/30 rounded-full blur-xl z-0"
            />
        </div>
    );
};

export default Mascot3D;
