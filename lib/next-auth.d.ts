import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      teacherApprovalStatus: string;
    };
  }
  interface User {
    role: string;
    teacherApprovalStatus: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    teacherApprovalStatus: string;
  }
}
