"use client";

import { useLocalStorage } from "@/hooks";
import { useEffect, useState } from "react";

import { Container, Flex } from "@chakra-ui/react";
import { CheckTranscribe, RegisterFile } from "@/components/normal";

const NormalContainer = () => {
  const [registerdId, setRegisteredId] = useState<string | undefined>();

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
    <Container w="76%" maxW="1800px">
      <Flex gap="20px">
        <RegisterFile
          handleSubmitRegisteredId={(newId) => {
            setRegisteredId(newId);
          }}
        />
        <CheckTranscribe registerdId={registerdId} />
      </Flex>
    </Container>
  );
};

export default NormalContainer;
