import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectMongo from './mongoose';
import User from './models/User';

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email:    { label: '이메일', type: 'text' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectMongo();
        const user = await User.findByEmail(credentials.email as string);
        if (!user) return null;

        // 일반 회원가입 유저는 이메일 인증 완료 전 로그인 제한
        if (user.emailVerified === false) return null;
        // 교사 계정은 관리자 승인 완료 전 로그인 제한
        if (user.role === 'teacher' && user.teacherApprovalStatus !== 'approved') return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

        return {
          id:    (user._id as { toString(): string }).toString(),
          email: user.email ?? '',
          name:  user.username ?? '',
          role:  user.role ?? 'student',
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id   = user.id ?? '';
        token.role = ((user as { role?: string }).role) ?? 'student';
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id   = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/m',
  },
  session: { strategy: 'jwt' },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
