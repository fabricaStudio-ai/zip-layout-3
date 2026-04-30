import { useState, useRef, useCallback } from 'react';

export interface AudioRecording {
  blob: Blob;
  url: string;
  duration: number;
}

export function useAudioRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<AudioRecording | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef(0);
  const isRecordingRef = useRef(false);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];
      recordingTimeRef.current = 0;
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const duration = recordingTimeRef.current;

        isRecordingRef.current = false;
        setRecordedAudio({ blob, url, duration });
        setRecordingTime(0);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      isRecordingRef.current = true;
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(recordingTimeRef.current);
      }, 1000);

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      throw new Error('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      mediaRecorderRef.current.stop();
      isRecordingRef.current = false;
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const resetRecording = useCallback(() => {
    isRecordingRef.current = false;
    recordingTimeRef.current = 0;
    setRecordedAudio(null);
    setRecordingTime(0);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isRecording,
    recordingTime,
    recordedAudio,
    startRecording,
    stopRecording,
    resetRecording,
    formatTime,
  };
}