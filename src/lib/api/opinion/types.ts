export interface OpinionTopic {
  topicId: number;
  title: string;
  abstract?: string;
  rules?: string;
  status: number;
  yesBuyPrice: string | null;
  noBuyPrice: string | null;
  yesLabel?: string;
  noLabel?: string;
  volume: string;
  volume24h: string;
  cutoffTime: number;
  createTime: number;
  thumbnailUrl?: string;
  labelName?: string[];
  chainId: string;
  childList?: OpinionTopic[];
}

export interface OpinionApiResponse {
  errno: number;
  errmsg: string;
  result: {
    list: OpinionTopic[];
  };
}
