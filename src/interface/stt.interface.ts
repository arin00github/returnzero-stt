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
