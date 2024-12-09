import { apollo, gql } from "@elysiajs/apollo";
import { Article, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const typeDefsGql = gql`
  type User {
    id: String
    name: String
    email: String
    password: String
    file_avatar: String
    created_at: String
    updated_at: String
    deleted_at: String
    articles: [Article]
  }

  type Article {
    id: ID
    name: String
    content: String
    user_id: ID
  }

  input ArticleInput {
    name: String
    content: String
    user_id: ID
  }

  type Query {
    getUsers: [User]
    getArticles: [Article]
    getUserByName(name: String): [User]
  }

  type Mutation {
    createArticle(article: ArticleInput!): Article
    deleteArticle(id: String!): Article
  }
`;

const resolversGql = {
  Query: {
    getUsers: async () => {
      return prisma.user.findMany({
        include: {
          articles: true,
        },
      });
    },
    getArticles: async () => {
      return prisma.article.findMany({
        include: {
          user: true,
        },
      });
    },
    getUserByName: async (_parent: any, { name }: { name: string }) => {
      return prisma.user.findMany({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
      });
    },
  },
  Mutation: {
    createArticle: async (_parent: any, { article }: { article: Article }) => {
      const { name, content, user_id } = article;
      return prisma.article.create({
        data: { name, content, user_id },
      });
    },
    deleteArticle: async (_parent: any, { id }: { id: string }) => {
      return prisma.article.delete({
        where: { id: id },
      });
    },
  },
};

export { typeDefsGql, resolversGql };
