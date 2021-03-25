import { useState, useEffect, useRef } from "react";

declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext
    }
}

const useAudioFromBuffer = (bufferArray?: number[]) => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

    useEffect(() => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx)
            return;
        audioCtxRef.current = new AudioCtx();
        return () => {
            audioCtxRef.current?.close();
        }
    }, []);

    useEffect(() => {
        if (!bufferArray)
            return setAudioBuffer(null);

        audioCtxRef.current?.decodeAudioData(
            new Uint8Array(bufferArray).buffer
        ).then(setAudioBuffer);
    }, [bufferArray]);

    const onAudioClick = () => {
        if (!audioCtxRef.current)
            return;

        if (!audioSource) {
            const source = audioCtxRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtxRef.current.destination);
            source.start();
            source.onended = () => {
                setAudioSource(null);
            }
            setAudioSource(source);
            return;
        }
        audioSource.stop();
        audioSource.disconnect(audioCtxRef.current.destination);
        setAudioSource(null);
    };

    return {
        audioExists: !!audioBuffer,
        isAudioPlaying: !!audioSource,
        onAudioClick
    };
}

export default useAudioFromBuffer;
