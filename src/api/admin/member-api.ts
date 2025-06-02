import axiosInstance from '../axios-config';
import { Member } from '@/types';

export const memberAPI = {
  getAllMembers: async (
    workspaceId: string
  ): Promise<{ data: { members: Member[] } }> => {
    try {
      const response = await axiosInstance.get(`/workspaces/${workspaceId}`);
      const members = response.data?.data?.teamSummary?.members as Member[];
      return { data: { members } };
    } catch (error) {
      throw error;
    }
  },
  removeMember: async (
    workspaceId: string,
    memberId: string
  ): Promise<{ data: { success: boolean } }> => {
    try {
      const response = await axiosInstance.delete(
        `/workspaces/${workspaceId}/users/${memberId}`
      );
      return { data: { success: response.data.success } };
    } catch (error: unknown) {
      throw error;
    }
  },
  updateMember: async (
    workspaceId: string,
    memberId: string,
    memberData: Partial<Member>
  ): Promise<{ data: { member: Member } }> => {
    try {
      const response = await axiosInstance.put(
        `/auth/${workspaceId}/user/${memberId}`,
        memberData
      );
      return { data: { member: response.data.data } };
    } catch (error) {
      throw error;
    }
  },
};
