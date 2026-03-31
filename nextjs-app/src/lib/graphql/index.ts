import { createSchema, createYoga } from "graphql-yoga";
import { getAllArticles, getArticleByPath } from "@/lib/content";

const typeDefs = /* GraphQL */ `
  type ArticleBody {
    html: String!
    plaintext: String!
  }

  type Article {
    _path: String!
    title: String!
    body: ArticleBody!
    author: String!
    publishDate: String!
    tags: [String!]
  }

  type ArticleList {
    items: [Article!]!
  }

  type ArticleByPath {
    item: Article
  }

  type Query {
    """List all articles."""
    articleList: ArticleList!

    """Fetch a single article by its JCR path."""
    articleByPath(_path: String!): ArticleByPath!
  }
`;

const resolvers = {
  Query: {
    articleList: async () => {
      const items = await getAllArticles();
      return { items };
    },
    articleByPath: async (_: unknown, args: { _path: string }) => {
      const item = await getArticleByPath(args._path);
      return { item };
    },
  },
};

export const schema = createSchema({ typeDefs, resolvers });

export const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
});
