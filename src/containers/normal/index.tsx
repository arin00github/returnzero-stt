"use client";

import { useLocalStorage } from "@/hooks";
import { useEffect } from "react";

import { Container } from "@chakra-ui/react";
import { CheckTranscribe, RegisterFile } from "@/components/normal";

const NormalContainer = () => {
  const { getLocalStorage, setLocalStorage } = useLocalStorage();

  const loadDataToken = async () => {
    console.log("loadDataToken");
    const res = await fetch("/api/stt/authenticate", { method: "POST" });
    if (res.status === 200) {
      const data = await res.json();
      console.log("data", data);
      setLocalStorage("access_token", data.result.access_token);
    }
  };

  useEffect(() => {
    const token = getLocalStorage("access_token");
    if (!token) {
      loadDataToken();
    }
  }, []);

  return (
    <Container>
      <RegisterFile />
      <CheckTranscribe />
    </Container>
  );
};

export default NormalContainer;
