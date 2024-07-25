import { ChangeEvent, useEffect, useState } from "react";

import {
  Badge,
  Box,
  Button,
  Flex,
  FormLabel,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Select,
} from "@chakra-ui/react";

import { useLocalStorage } from "@/hooks";
import { LANGUAGES } from "@/constant/language";

const isTrue = (val: string) => val === "true";

interface RegisterFileProps {
  handleSubmitRegisteredId: (id: string) => void;
}

export const RegisterFile = (props: RegisterFileProps) => {
  const [newFile, setNewFile] = useState<File | undefined>(undefined);
  const [config, setConfig] = useState({
    model_name: "sommers",
    language: "ko",
    use_itn: "true",
    use_profanity_filter: "true",
    use_disfluency_filter: "true",
    use_word_timestamp: "false",
    use_diarization: "false",
    diarization: {
      spk_count: 2,
    },
    use_paragraph_splitter: "true",
    paragraph_splitter: {
      max: 50,
    },
    domain: "GENERAL",
  });

  const [keyword, setKeyword] = useState<string>("");
  const [keywordArray, setKeywordArray] = useState<string[]>([]);

  const { getLocalStorage } = useLocalStorage();

  const requestRegisterFile = async () => {
    try {
      if (!newFile) {
        return;
      }
      const token = getLocalStorage("access_token");
      if (!token) return;
      const configFilter = {
        model_name: config.model_name,
        ...(config.model_name === "whisper" ? { language: config.language } : {}),
        use_itn: isTrue(config.use_itn),
        use_disfluency_filter: isTrue(config.use_disfluency_filter),
        use_profanity_filter: isTrue(config.use_profanity_filter),
        use_work_timestamp: isTrue(config.use_word_timestamp),
        use_diarization: isTrue(config.use_diarization),
        ...(isTrue(config.use_diarization)
          ? {
              diarization: {
                spk_count: config.diarization.spk_count,
              },
            }
          : {}),
        use_paragraph_splitter: isTrue(config.use_paragraph_splitter),
        ...(isTrue(config.use_paragraph_splitter)
          ? {
              paragraph_splitter: {
                max: config.paragraph_splitter.max,
              },
            }
          : {}),
        domain: config.domain,
      };
      const formData = new FormData();
      formData.append("file", newFile);
      formData.append("token", token);
      formData.append("config", JSON.stringify(configFilter));
      const res = await fetch("/api/stt/transcribe", {
        method: "POST",
        body: formData,
      });
      if (res.status === 200) {
        const data = await res.json();
        console.log("data", data);
        props.handleSubmitRegisteredId(data.result.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileArray = e.target.files;
    if (fileArray && fileArray?.length > 0) {
      setNewFile(fileArray[0]);
    } else {
      alert("파일을 선택하세요.");
    }
  };
  const languageOptions = Object.entries(LANGUAGES).map((item) => {
    return {
      value: item[0],
      label: item[1],
    };
  });

  return (
    <Box w="100%">
      <Flex alignItems={"baseline"} gap="12px">
        <Heading marginTop={"40px"}>파일전사요청</Heading>
      </Flex>
      <Box marginTop={"40px"}>
        <Flex marginBottom={"12px"}>
          <Input type="file" onChange={handleFileChange} />
        </Flex>

        <Flex marginBottom={"12px"}>
          <FormLabel w="150px">음성인식모델</FormLabel>
          <Select
            value={config.model_name}
            onChange={(e) => {
              setConfig({ ...config, model_name: e.target.value });
            }}
          >
            <option value="sommers">sommers</option>
            <option value="whisper">whisper</option>
          </Select>
        </Flex>
        {config.model_name === "whisper" && (
          <Flex marginBottom={"12px"}>
            <FormLabel w="150px">언어</FormLabel>
            <Select
              value={config.language}
              onChange={(e) => {
                setConfig({ ...config, language: e.target.value });
              }}
            >
              {languageOptions.map((opt) => {
                return (
                  <option value={opt.value} key={opt.value}>
                    {opt.label}
                  </option>
                );
              })}
            </Select>
          </Flex>
        )}
        <Flex marginBottom={"12px"}>
          <FormLabel w="150px">화자분리</FormLabel>
          <RadioGroup
            value={config.use_diarization}
            onChange={(val) => {
              setConfig({ ...config, use_diarization: val });
            }}
          >
            <Radio value="true">사용</Radio>
            <Radio value="false">미사용</Radio>
          </RadioGroup>
        </Flex>
        {isTrue(config.use_diarization) && (
          <Flex marginBottom={"12px"}>
            <FormLabel w="150px">발화에 참여한 수</FormLabel>
            <NumberInput
              value={config.diarization.spk_count}
              onChange={(_, val) => {
                setConfig({ ...config, diarization: { spk_count: val } });
              }}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Flex>
        )}
        <Flex marginBottom={"12px"}>
          <FormLabel w="150px">비속어필터</FormLabel>
          <RadioGroup
            value={config.use_profanity_filter}
            onChange={(val) => {
              setConfig({ ...config, use_profanity_filter: val });
            }}
          >
            <Radio value="true">사용</Radio>
            <Radio value="false">미사용</Radio>
          </RadioGroup>
        </Flex>
        <Flex marginBottom={"12px"}>
          <FormLabel w="150px">간투어필터</FormLabel>
          <RadioGroup
            value={config.use_disfluency_filter}
            onChange={(val) => {
              setConfig({ ...config, use_disfluency_filter: val });
            }}
          >
            <Radio value="true">사용</Radio>
            <Radio value="false">미사용</Radio>
          </RadioGroup>
        </Flex>
        <Flex marginBottom={"12px"}>
          <FormLabel w="150px">영어/숫자단위 변환</FormLabel>
          <RadioGroup
            value={config.use_itn}
            onChange={(val) => {
              setConfig({ ...config, use_itn: val });
            }}
          >
            <Radio value="true">사용</Radio>
            <Radio value="false">미사용</Radio>
          </RadioGroup>
        </Flex>
        <Flex marginBottom={"12px"}>
          <FormLabel w="150px">도메인</FormLabel>
          <RadioGroup
            value={config.domain}
            onChange={(val) => {
              setConfig({ ...config, domain: val });
            }}
          >
            <Radio value="GENERAL">일반</Radio>
            <Radio value="CALL">통화</Radio>
          </RadioGroup>
        </Flex>
        <Flex marginBottom={"12px"}>
          <FormLabel w="150px">단어별 timestamp </FormLabel>
          <RadioGroup
            value={config.use_word_timestamp}
            onChange={(val) => {
              setConfig({ ...config, use_word_timestamp: val });
            }}
          >
            <Radio value="true">사용</Radio>
            <Radio value="false">미사용</Radio>
          </RadioGroup>
        </Flex>
        <Flex marginBottom={"12px"}>
          <FormLabel w="150px">문단나누기 </FormLabel>
          <RadioGroup
            value={config.use_paragraph_splitter}
            onChange={(val) => {
              setConfig({ ...config, use_paragraph_splitter: val });
            }}
          >
            <Radio value="true">사용</Radio>
            <Radio value="false">미사용</Radio>
          </RadioGroup>
        </Flex>
        <Flex marginBottom={"12px"}>
          <FormLabel w="150px">한 문단의 최대글자수</FormLabel>
          <NumberInput
            value={config.paragraph_splitter.max}
            onChange={(_, val) => {
              setConfig({ ...config, paragraph_splitter: { max: val } });
            }}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Flex>
        <Flex marginBottom={"12px"}>
          <FormLabel w="150px">키워드 부스트</FormLabel>
          <Input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && keyword) {
                const newArray = keywordArray.concat([keyword]);
                setKeywordArray(newArray);
                setKeyword("");
              }
            }}
          ></Input>
        </Flex>
        <Flex>
          {keywordArray.map((word, idx) => {
            return (
              <Badge key={`word_${idx}`}>
                {word}
                <Button
                  size="sm"
                  onClick={() => {
                    const newArray = keywordArray.filter((it) => it !== word);
                    setKeywordArray(newArray);
                  }}
                >
                  X
                </Button>
              </Badge>
            );
          })}
        </Flex>
        <Flex marginTop={"30px"} justify={"center"}>
          <Button onClick={requestRegisterFile} colorScheme="blue" w="120px">
            요청
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};
