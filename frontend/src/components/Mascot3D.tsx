import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mascotNormal from '../assets/mascot_normal.png';
import mascotHiding from '../assets/mascot_hiding.png';

interface Mascot3DProps {
    isHiding: boolean;
    isFloating?: boolean;
}

const Mascot3D: React.FC<Mascot3DProps> = ({ isHiding, isFloating = true }) => {
    return (
        <div className="relative w-48 h-48 md:w-56 md:h-56 mx-auto drop-shadow-2xl">
            <AnimatePresence mode="wait">
                <motion.div
                    key={isHiding ? 'hiding' : 'normal'}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: isFloating ? [0, -10, 0] : 0
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                        duration: 0.5,
                        y: isFloating ? {
                            repeat: Infinity,
                            duration: 4,
                            ease: "easeInOut"
                        } : {}
                    }}
                    className="w-full h-full flex items-center justify-center"
                >
                    <img
                        src={isHiding ? mascotHiding : mascotNormal}
                        alt="Mascot"
                        className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)]"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Ground Shadow */}
            <motion.div
                animate={{
                    scale: isFloating ? [1, 0.8, 1] : 1,
                    opacity: isFloating ? [0.2, 0.1, 0.2] : 0.2
                }}
                transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut"
                }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/20 rounded-full blur-md"
            />
        </div>
    );
};

export default Mascot3D;
