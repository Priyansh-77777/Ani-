import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Visage } from '@readyplayerme/visage';
import './App.css';

const LOVABLE_API_KEY = process.env.REACT_APP_LOVABLE_API_KEY;
const LOVABLE_CHARACTER_ID = process.env.REACT_APP_LOVABLE_CHARACTER_ID;

const Companion = ({ modelSrc, audio }) => {
    const visageRef = useRef();
    useEffect(() => {
        if (audio && visageRef.current) {
            visageRef.current.speak(audio);
        }
    }, [audio]);
    return <Visage ref={visageRef} modelSrc={modelSrc} emotion="happy" headMovement={true} />;
};

export default function App() {
    // IMPORTANT: Replace with YOUR .glb URL from Ready Player Me!
    const modelSrc = 'https://models.readyplayer.me/664e6e64235316eab44d2d4c.glb';
    const [userInput, setUserInput] = useState('');
    const [aiAudio, setAiAudio] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput || isLoading) return;
        setIsLoading(true);
        setAiAudio(null);

        try {
            const response = await fetch(`https://api.lovable.ai/v1/characters/${LOVABLE_CHARACTER_ID}/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${LOVABLE_API_KEY}`
                },
                body: JSON.stringify({ text: userInput, user_id: "web-user-777" }),
            });
            
            const data = await response.json();
            
            if (data.audio_url) {
                setAiAudio(data.audio_url);
            } else {
                console.error("Lovable API did not return audio_url", data);
            }

        } catch (error) {
            console.error("Failed to get AI response from Lovable:", error);
        } finally {
            setIsLoading(false);
            setUserInput('');
        }
    };

    return (
        <div className="App">
            <Canvas camera={{ position: [0, 1.5, 1.2], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[3, 3, 3]} />
                <Companion modelSrc={modelSrc} audio={aiAudio} />
                <OrbitControls target={[0, 1.5, 0]} enablePan={false} enableZoom={false} />
            </Canvas>
            <div className="ui-container">
                <form onSubmit={handleSubmit}>
                    <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Talk to Ani..." disabled={isLoading} />
                    <button type="submit" disabled={isLoading}>{isLoading ? 'Thinking...' : 'Send'}</button>
                </form>
            </div>
        </div>
    );
}