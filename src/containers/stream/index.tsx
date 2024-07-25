// import { socket } from "@/socket";
import { TalkBox } from "@/components/stream";
import { StreamResponseItem } from "@/interface/stt.interface";
import { Button, Container, Flex, Heading, Tag } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

import SocketIOClient, { Socket } from "socket.io-client";

const StreamContainer = () => {
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcripts, setTranscript] = useState<StreamResponseItem[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("useEffect socket");
    const socket = SocketIOClient("ws://localhost:5100", {
      path: "/api/stt/socket",
    });

    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
      setIsConnected(true);
      // startRecording();
    });

    socket.on("disconnect", () => {
      console.log("SOCKET DISCONNECTED!");
      setIsConnected(false);
    });

    socket.on("error", (ev) => {
      console.log("Socket Error", ev);
    });

    socket.on("message", (message) => {
      console.log("Socket message", message);
    });

    socket.on("transcript", (newText: StreamResponseItem) => {
      console.log("Socket Transcript", transcripts);
      setTranscript(transcripts.concat([newText]));
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  let isSpeaking = false; //

  const startRecording = async () => {
    const stream = await getMicrophoneAccess();
    if (stream) {
      // MediaRecorder 객체 생성 (오디오 스트림을 녹음하기 위해)
      mediaRecorderRef.current = new MediaRecorder(stream);

      // 오디오 컨텍스트와 분석기 생성 (음성 감지를 위한 설정)
      // 오디오 컨텍스트 생성 (오디오 작업을 수행할 수 있는 환경)
      const audioContext = new AudioContext();
      // 오디오 소스를 스트림으로 설정 (마이크 입력을 소스로 설정)
      const source = audioContext.createMediaStreamSource(stream);
      // 오디오 분석기 생성 (오디오 데이터를 분석하는 도구)
      const analyser = audioContext.createAnalyser();
      // 스크립트 프로세서 생성 (오디오 처리 작업을 위한 프로세서)
      const processor = audioContext.createScriptProcessor(256, 1, 1);

      // 소스를 분석기와 연결 (마이크 입력 데이터를 분석기로 보냄)
      source.connect(analyser);
      // 분석기를 프로세서와 연결 (분석된 데이터를 프로세서로 보냄)
      analyser.connect(processor);
      // 프로세서를 오디오 컨텍스트의 출력에 연결 (프로세서에서 나온 데이터를 출력으로 보냄)
      processor.connect(audioContext.destination);

      // 음성 감지 로직
      // 오디오 처리 이벤트 설정 (오디오 데이터가 처리될 때마다 호출됨)
      processor.onaudioprocess = (event) => {
        // 입력 버퍼에서 채널 데이터를 가져옴 (오디오 데이터)
        const inputData = event.inputBuffer.getChannelData(0);
        let sum = 0.0;

        // 모든 오디오 샘플의 제곱 합 계산
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }

        // RMS (Root Mean Square) 계산 (오디오 신호의 에너지를 나타냄)
        const rms = Math.sqrt(sum / inputData.length);
        // RMS 값이 임계값을 넘으면 (0.01) isSpeaking을 true로 설정 (말하고 있는 것으로 간주)
        const currentlySpeaking = rms > 0.01; // 임계값을 조정하여 감도 조절 가능

        // 음성이 감지된 경우 상태 업데이트
        isSpeaking = currentlySpeaking;
      };

      // 데이터가 사용 가능할 때마다 호출되는 이벤트 핸들러 설정
      mediaRecorderRef.current.ondataavailable = (event) => {
        // 녹음된 데이터가 존재하고 음성이 감지된 경우에만
        if (event.data.size > 0 && isSpeaking && socketRef.current) {
          console.log("socket send data:", event.data);
          socketRef.current.emit("audio", event.data);
        }
      };

      mediaRecorderRef.current.start(250);
    } else {
      setError("Microphone access denied.");
    }
  };

  const handleStartStop = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsRecording((prev) => !prev);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.emit("end", "EOS");
    }
  };

  const getMicrophoneAccess = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      return null;
    }
  };

  // useEffect(() => {
  //   const startVoiceDetection = async () => {
  //     const stream = await getMicrophoneAccess();
  //     if (stream) {
  //       detectVoice(stream, setIsSpeaking);
  //     } else {
  //       setError("Microphone access denied.");
  //     }
  //   };

  //   startVoiceDetection();
  // }, []);

  return (
    <Container w="70%" maxW="1800px">
      <Flex alignItems={"baseline"} gap="12px">
        <Heading marginTop={"40px"}>스트리밍 STT</Heading>
        <Tag colorScheme={isConnected ? "green" : "red"} h="32px">
          Status: {isConnected ? "connected" : "disconnected"}
        </Tag>
      </Flex>
      <Flex my={"40px"}>
        <Button colorScheme="blue" onClick={handleStartStop}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
      </Flex>
      <TalkBox transcripts={transcripts} />
    </Container>
  );
};

export default StreamContainer;
