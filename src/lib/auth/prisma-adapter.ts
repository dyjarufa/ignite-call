import { Adapter } from 'next-auth/adapters'
import { prisma } from '../prisma'

export function PrismaAdapter(): Adapter {
  return {
    async createUser(user) {
      return null
    },

    async getUser(id) {
      const user = await prisma.user.findFirstOrThrow({
        where: {
          id,
        },
      })

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email!,
        emailVerified: null,
        avatar_url: user.avatar_url!,
      }
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findFirstOrThrow({
        where: {
          email,
        },
      })

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email!,
        emailVerified: null,
        avatar_url: user.avatar_url!,
      }
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const { user } = await prisma.account.findUniqueOrThrow({
        where: {
          // ? estou buscando o união desses 2 campos no tabela Account do meu schema.prisma
          provider_provider_account_Id: {
            provider,
            provider_account_Id: providerAccountId,
          },
        },
        /** 
          // ? include:

         // * No Prisma, o método `include` é uma maneira poderosa de buscar relacionamentos de um modelo, permitindo a você obter informações relacionadas de outra tabela sem precisar fazer múltiplas consultas.

          // * No código que você forneceu, a função `getUserByAccount` está buscando um registro na tabela `account` com base em dois critérios: `provider` e `providerAccountId`. No entanto, em vez de retornar apenas informações dessa conta, você também quer obter informações sobre o usuário associado a essa conta.

          // * O Prisma usa o conceito de "relacionamento implícito" para isso. Se você tem um relacionamento definido no seu schema entre `account` e `user`, o Prisma permite que você busque informações do usuário associado sem precisar de uma consulta separada. 

          // * O `include: { user: true }` faz exatamente isso:

          // * - `include`: Indica que você quer incluir dados relacionados.
          // * - `user: true`: Indica que você quer incluir dados da tabela `user` associada ao registro de `account` encontrado.

         // * Assim, o resultado retornado pelo Prisma incluirá tanto os detalhes da conta quanto os detalhes do usuário associado, e você pode acessar esses detalhes usando `result.user`, conforme visto no seu código.

         // * Em resumo, o `include` é uma maneira conveniente e eficiente de buscar dados relacionados em uma única consulta. É particularmente útil em aplicações onde o desempenho e a minimização de consultas ao banco de dados são cruciais.
         */
        include: {
          user: true,
        },
      })

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email!,
        emailVerified: null,
        avatar_url: user.avatar_url!,
      }
    },
    async updateUser(user) {
      const prismaUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      })

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        username: prismaUser.username,
        email: prismaUser.email!,
        emailVerified: null,
        avatar_url: prismaUser.avatar_url!,
      }
    },
    async deleteUser(userId) {
      return
    },
    async linkAccount(account) {
      await prisma.account.create({
        data: {
          user_Id: account.userId,
          type: account.type,
          provider: account.provider,
          provider_account_Id: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      })
    },
    async unlinkAccount({ providerAccountId, provider }) {
      return
    },
    async createSession({ sessionToken, userId, expires }) {
      await prisma.session.create({
        data: {
          user_id: userId,
          expires,
          session_token: sessionToken,
        },
      })

      return {
        userId,
        expires,
        sessionToken,
      }
    },
    async getSessionAndUser(sessionToken) {
      const { user, ...session } = await prisma.session.findUniqueOrThrow({
        where: {
          session_token: sessionToken,
        },
        include: {
          user: true,
        },
      })
      return {
        session: {
          expires: session.expires,
          userId: session.user_id,
          sessionToken: session.session_token,
        },
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email!,
          emailVerified: null,
          avatar_url: user.avatar_url!,
        },
      }
    },
    async updateSession({ sessionToken, expires, userId }) {
      const prismaSession = await prisma.session.update({
        where: {
          session_token: sessionToken,
        },
        data: {
          expires,
          user_id: userId,
        },
      })
      return {
        sessionToken: prismaSession.session_token, //? prismaSession: uso os dados retornados do bd
        expires: prismaSession.expires,
        userId: prismaSession.user_id,
      }
    },
    async deleteSession(sessionToken) {
      return
    },
  }
}
