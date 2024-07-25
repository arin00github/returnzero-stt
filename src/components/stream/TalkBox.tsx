import { StreamResponseItem } from "@/interface/stt.interface";
import { Box } from "@chakra-ui/react";

interface TalkBoxProps {
  transcripts: StreamResponseItem[];
}

export const TalkBox = (props: TalkBoxProps) => {
  const { transcripts } = props;
  return (
    <Box minH={"500px"} h="60vh" w="100%" bg="gray.100">
      <Box>
        {transcripts.map((item, idx) => {
          return <Box key={`stream_${item.seq}_${item.start_at}_${idx}`}>{item.alternatives[0].text}</Box>;
        })}
      </Box>
    </Box>
  );
};
