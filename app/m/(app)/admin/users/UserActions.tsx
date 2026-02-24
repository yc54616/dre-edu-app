'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, BarChart2, BadgeCheck } from 'lucide-react';
import RatingEditor from './RatingEditor';

export default function UserActions({
  userId,
  username,
  currentRole,
  teacherApprovalStatus,
}: {
  userId: string;
  username: string;
  currentRole: string;
  teacherApprovalStatus: 'approved' | 'pending';
}) {
  const router = useRouter();
  const [deleting,    setDeleting]    = useState(false);
  const [changing,    setChanging]    = useState(false);
  const [approving,   setApproving]   = useState(false);
  const [showRating,  setShowRating]  = useState(false);
  const isAdminRow = currentRole === 'admin';

  const changeRole = async (newRole: string) => {
    setChanging(true);
    await fetch(`/api/m/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    setChanging(false);
    router.refresh();
  };

  const approveTeacher = async () => {
    setApproving(true);
    await fetch(`/api/m/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherApprovalStatus: 'approved' }),
    });
    setApproving(false);
    router.refresh();
  };

  const deleteUser = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setDeleting(true);
    await fetch(`/api/m/admin/users/${userId}`, { method: 'DELETE' });
    setDeleting(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {/* 레이팅 편집 */}
        <button
          onClick={() => setShowRating(true)}
          title="레이팅 편집"
          className="p-1.5 text-gray-400 hover:text-[var(--color-dre-blue)] hover:bg-blue-50 rounded-lg transition-colors"
        >
          <BarChart2 size={14} />
        </button>

        {/* 역할 변경 */}
        <select
          value={currentRole}
          onChange={(e) => changeRole(e.target.value)}
          disabled={changing || approving || isAdminRow}
          title={isAdminRow ? '관리자 계정은 권한을 변경할 수 없습니다.' : '역할 변경'}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:border-[var(--color-dre-blue)] outline-none cursor-pointer disabled:opacity-50"
        >
          <option value="student">학생</option>
          <option value="teacher">교사</option>
          <option value="admin">관리자</option>
        </select>

        {/* 교사 승인 */}
        {currentRole === 'teacher' && teacherApprovalStatus === 'pending' && (
          <button
            onClick={approveTeacher}
            disabled={approving || changing}
            title="교사 승인"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            {approving ? <Loader2 size={12} className="animate-spin" /> : <BadgeCheck size={12} />}
            승인
          </button>
        )}

        {/* 삭제 */}
        <button
          onClick={deleteUser}
          disabled={deleting || approving || isAdminRow}
          title={isAdminRow ? '관리자 계정은 삭제할 수 없습니다.' : '사용자 삭제'}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>

      {showRating && (
        <RatingEditor
          userId={userId}
          username={username}
          onClose={() => setShowRating(false)}
        />
      )}
    </>
  );
}
