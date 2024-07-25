//
import { useLocalStorage } from "@/hooks";
import { Box, Button, Container, Heading, Input } from "@chakra-ui/react";
import { ChangeEvent, useState } from "react";

export const CheckTranscribe = () => {
  const [inputId, setInputId] = useState<string>("");

  const { getLocalStorage } = useLocalStorage();

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInputId(e.target.value);
  };

  const loadTranscribeDetail = async () => {
    try {
      if (!inputId) return;
      const token = getLocalStorage("access_token");
      if (!token) return;
      const formData = new FormData();
      formData.append("token", token || "");
      formData.append("id", inputId);
      const res = await fetch("/api/stt/transcribeDetail", {
        method: "POST",
        body: formData,
      });
      if (res.status === 200) {
        const data = await res.json();
        console.log("res", data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box style={{ marginTop: 30 }}>
      <Heading>파일전사 결과확인</Heading>
      <Input value={inputId} onChange={handleChangeInput} />
      <Button onClick={loadTranscribeDetail}>로딩</Button>
    </Box>
  );
};
