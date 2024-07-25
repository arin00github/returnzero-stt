//
import { useLocalStorage } from "@/hooks";
import { NormalGetDetailResult, Utterances } from "@/interface/stt.interface";
import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface CheckTranscribeProps {
  registerdId: string | undefined;
}

export const CheckTranscribe = (props: CheckTranscribeProps) => {
  const [status, setStatus] = useState<string>("");
  const [utterences, setUtterences] = useState<Utterances[]>([]);

  const { registerdId } = props;

  const { getLocalStorage } = useLocalStorage();

  const loadTranscribeDetail = async (id: string) => {
    try {
      const token = getLocalStorage("access_token");
      if (!token) return;

      const bodyObject = {
        id: id,
        token,
      };
      const res = await fetch("/api/stt/transcribeDetail", {
        method: "POST",
        body: JSON.stringify(bodyObject),
      });
      if (res.status === 200) {
        const data = await res.json();
        console.log("res data", data);
        const result = data.result as NormalGetDetailResult;
        setStatus(result.status);
        if (result.results) {
          setUtterences(result.results.utterances);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let timer: any;
    if (registerdId) {
      timer = setTimeout(() => {
        loadTranscribeDetail(registerdId);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [registerdId]);

  return (
    <Box w="100%">
      <Flex alignItems={"baseline"} gap="12px">
        <Heading marginTop={"40px"}>상세조회 확인</Heading>
      </Flex>
      <Flex marginTop={"40px"} gap={"12px"}>
        {registerdId && <Box>{registerdId}</Box>}
        <Box>{status}</Box>
      </Flex>
      <Flex marginTop={"24px"}>
        <Button
          onClick={() => {
            if (registerdId) {
              loadTranscribeDetail(registerdId);
            }
          }}
        >
          reload
        </Button>
      </Flex>
      <Stack spacing={3} marginTop={"32px"}>
        {utterences.map((utter, idx) => {
          return <Text key={`msg_${utter.duration}_${utter.start_at}_${idx}`}>{utter.msg}</Text>;
        })}
      </Stack>
    </Box>
  );
};
