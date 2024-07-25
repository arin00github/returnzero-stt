export interface StreamResponseItem {
  seq: number;
  start_at: number;
  duration: number;
  final: boolean;
  alternatives: [
    {
      text: string;
      confidence: number;
      words: { text: string; duration: number; start_at: number; confidence: number }[];
    }
  ];
}

export type Utterances = {
  duration: number;
  msg: string;
  spk: number;
  spk_type: string;
  start_at: number;
};
export interface NormalGetDetailResult {
  id: string;
  results?: {
    utterances: Utterances[];
    verified: boolean;
  };
  status: string;
}
