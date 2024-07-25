import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import WebSocket from "ws";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { PassThrough } from "stream";

import { NextApiResponseServerIO } from "@/type/socket";

ffmpeg.setFfmpegPath(ffmpegPath.path);

const SAMPLE_RATE = 12000;

const ServerHost = "openapi.vito.ai";

// eslint-disable-next-line import/no-anonymous-default-export
const ioHandler = (_req: NextApiRequest, res: NextApiResponseServerIO) => {
  console.log("[API Stream ]", _req.query);
  if (!res?.socket?.server.io) {
    console.log("### New Socket.io server...✅");

    const httpServer: NetServer = res?.socket?.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/stt/socket",
    });

    io.on("connection", async (socket) => {
      const ffmpegStream = new PassThrough();
      const transformedStream = new PassThrough();

      ffmpeg(ffmpegStream)
        .inputFormat("webm")
        .audioCodec("pcm_s16le") // LINEAR16 codec
        .audioFrequency(16000)
        .audioChannels(1)
        .format("wav") // desired output forma
        .outputOptions("-movflags frag_keyframe+empty_moov")
        .pipe(transformedStream);

      console.log("[SERVER] io connection");
      // console.log("socket audio event", ev);
      try {
        const data = new URLSearchParams({
          client_id: process.env.CLIENT_ID || "",
          client_secret: process.env.CLIENT_SECRETE || "",
        });

        const tokenResponse = await fetch(`https://openapi.vito.ai/v1/authenticate`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: data,
        });

        if (tokenResponse.status !== 200) {
          throw new Error("Failed to authenticate");
        }
        const resData = await tokenResponse.json();

        const token = resData.access_token;

        const wsUrl = new URL(`wss://${ServerHost}/v1/transcribe:streaming`);
        wsUrl.searchParams.set("sample_rate", SAMPLE_RATE.toString());
        wsUrl.searchParams.set("encoding", "LINEAR16");
        wsUrl.searchParams.set("use_itn", "true");
        const vitoSocket = new WebSocket(wsUrl.toString(), {
          headers: {
            Accept: "application/json",
            Authorization: `bearer ${token}`,
          },
        });

        vitoSocket.on("open", () => {
          console.log("Connected to Vito API");
        });

        vitoSocket.on("message", (message: any) => {
          console.log(`Vito API message: ${message}`);
          socket.emit("transcript", message.toString());
        });

        vitoSocket.on("close", () => {
          console.log("Disconnected from Vito API");
        });

        vitoSocket.on("error", (error: any) => {
          console.error("Vito API error:", error);
          socket.emit("error", "Error with Vito API connection");
        });
        transformedStream.on("data", (chunk) => {
          console.log("TransformedStream chunk:", !!chunk);
          if (vitoSocket.readyState === WebSocket.OPEN) {
            console.log("Sending transformed data to Vito API");
            vitoSocket.send(chunk);
          } else {
            console.error("WebSocket is not open. ReadyState:", vitoSocket.readyState);
          }
        });

        transformedStream.on("error", (error) => {
          console.error("Error in transformedStream:", error);
        });

        socket.on("audio", (data) => {
          console.log("Received audio data from client");
          if (ffmpegStream.writable) {
            ffmpegStream.write(data);
          } else {
            console.error("FFmpeg stream is not writable");
          }
        });

        socket.on("disconnect", () => {
          console.log("Client disconnected:", socket.id);
          vitoSocket.close();
        });
      } catch {
        res.status(500).json({ message: "[Error] socket & ws" });
      }
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
