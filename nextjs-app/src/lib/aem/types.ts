export interface ArticleModel {
  _path: string;
  title: string;
  body: {
    html: string;
    plaintext: string;
  };
  author: string;
  publishDate: string;
  tags?: string[];
}

export interface ArticleListResponse {
  articleList: {
    items: ArticleModel[];
  };
}

export interface ArticleByPathResponse {
  articleByPath: {
    item: ArticleModel;
  };
}

export interface SlingModelResponse {
  [key: string]: unknown;
}
