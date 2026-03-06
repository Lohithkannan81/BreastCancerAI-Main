import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface MascotProps {
    isEmailFocused: boolean;
    isPasswordFocused: boolean;
    isPasswordVisible: boolean;
    mouseX: number;
    mouseY: number;
}

const Mascot: React.FC<MascotProps> = ({
    isEmailFocused,
    isPasswordFocused,
    isPasswordVisible,
    mouseX,
    mouseY,
}) => {
    // Spring config for smooth, bouncy movements
    const springConfig = { stiffness: 150, damping: 15, mass: 0.5 };

    // Motion values for pupils
    const pX = useMotionValue(0);
    const pY = useMotionValue(0);

    // Smoothly animate to target values
    const smoothPX = useSpring(pX, springConfig);
    const smoothPY = useSpring(pY, springConfig);

    // Motion values for arms (covering eyes)
    const armRot = useMotionValue(0);
    const armY = useMotionValue(40);

    const smoothArmRot = useSpring(armRot, { stiffness: 120, damping: 12 });
    const smoothArmY = useSpring(armY, { stiffness: 120, damping: 12 });

    useEffect(() => {
        // 1. Hands (Covering Eyes Logic)
        if (isPasswordVisible) {
            // Peek through hands (hands slightly lowered/separated)
            armRot.set(-10);
            armY.set(-20);
        } else if (isPasswordFocused) {
            // Fully cover eyes
            armRot.set(-30);
            armY.set(-45);
        } else {
            // Hands down resting
            armRot.set(0);
            armY.set(40);
        }

        // 2. Eyes Logic
        if (isPasswordFocused && !isPasswordVisible) {
            // Eyes closed (we handle this via rendering logic, but move pupils up)
            pX.set(0);
            pY.set(-10);
        } else if (isEmailFocused) {
            // Look down at input
            pX.set(0);
            pY.set(15);
        } else {
            // Track mouse
            // mouseX and mouseY are normalized between -1 and 1
            // Limit pupil movement to keep them inside the eyes
            const maxPupilTravel = 8;
            pX.set(mouseX * maxPupilTravel);
            pY.set(mouseY * maxPupilTravel);
        }
    }, [mouseX, mouseY, isEmailFocused, isPasswordFocused, isPasswordVisible, armRot, armY, pX, pY]);

    const areEyesCovered = isPasswordFocused && !isPasswordVisible;

    return (
        <div className="relative w-32 h-32 mx-auto">
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                {/* Shadow */}
                <ellipse cx="100" cy="180" rx="60" ry="10" fill="rgba(0,0,0,0.1)" className="blur-sm" />

                {/* Body/Head (Cute Robot or Ghost shape) */}
                <motion.path
                    d="M 50 100 Q 50 40 100 40 Q 150 40 150 100 L 150 160 Q 150 180 130 180 L 70 180 Q 50 180 50 160 Z"
                    fill="#f8fafc"
                    stroke="#e2e8f0"
                    strokeWidth="4"
                    initial={{ y: 10 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                />

                {/* Blush / Cheeks */}
                <ellipse cx="75" cy="125" rx="12" ry="6" fill="#fecdd3" opacity="0.6" className="blur-[2px]" />
                <ellipse cx="125" cy="125" rx="12" ry="6" fill="#fecdd3" opacity="0.6" className="blur-[2px]" />

                {/* Left Eye */}
                <g transform="translate(75, 100)">
                    {areEyesCovered ? (
                        // Closed eye line
                        <path d="M -12 0 Q 0 8 12 0" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
                    ) : (
                        <>
                            <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                            <motion.circle
                                cx={smoothPX}
                                cy={smoothPY}
                                r="7"
                                fill="#1e293b"
                            />
                            <motion.circle
                                cx={useTransform(smoothPX, x => x - 3)}
                                cy={useTransform(smoothPY, y => y - 3)}
                                r="2.5"
                                fill="#ffffff"
                            />
                        </>
                    )}
                </g>

                {/* Right Eye */}
                <g transform="translate(125, 100)">
                    {areEyesCovered ? (
                        // Closed eye line
                        <path d="M -12 0 Q 0 8 12 0" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
                    ) : (
                        <>
                            <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                            <motion.circle
                                cx={smoothPX}
                                cy={smoothPY}
                                r="7"
                                fill="#1e293b"
                            />
                            <motion.circle
                                cx={useTransform(smoothPX, x => x - 3)}
                                cy={useTransform(smoothPY, y => y - 3)}
                                r="2.5"
                                fill="#ffffff"
                            />
                        </>
                    )}
                </g>

                {/* Mouth */}
                {isEmailFocused ? (
                    // Small curious O shape
                    <circle cx="100" cy="140" r="4" fill="#64748b" />
                ) : isPasswordFocused && !isPasswordVisible ? (
                    // Worried straight line
                    <path d="M 95 138 L 105 138" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
                ) : isPasswordVisible ? (
                    // Shocked / Open mouth
                    <ellipse cx="100" cy="142" rx="6" ry="8" fill="#64748b" />
                ) : (
                    // Smile
                    <path d="M 90 135 Q 100 148 110 135" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
                )}

                {/* Left Arm/Hand */}
                <motion.g
                    style={{
                        x: 60,
                        y: useTransform(smoothArmY, y => y + 100), // Base Y = 100
                        rotate: isPasswordVisible ? -20 : isPasswordFocused ? smoothArmRot : -10 // Rotate inwards when covering
                    }}
                >
                    <circle cx="0" cy="0" r="16" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="3" />
                    {/* Small paw lines */}
                    <path d="M 4 -5 L 4 5 M -4 -5 L -4 5 M 0 -7 L 0 7" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" className="opacity-50" />
                </motion.g>

                {/* Right Arm/Hand */}
                <motion.g
                    style={{
                        x: 140,
                        y: useTransform(smoothArmY, y => y + 100),
                        rotate: isPasswordVisible ? 20 : isPasswordFocused ? useTransform(smoothArmRot, r => -r) : 10
                    }}
                >
                    <circle cx="0" cy="0" r="16" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="3" />
                    {/* Small paw lines */}
                    <path d="M 4 -5 L 4 5 M -4 -5 L -4 5 M 0 -7 L 0 7" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" className="opacity-50" />
                </motion.g>
            </svg>
        </div>
    );
};

export default Mascot;
