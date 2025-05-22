import axiosInstance from '../axios-config';

export const invitationAPI = {
  // Create a new invitation
  createInvitation: async (workspaceId: string, invitationData: any) => {
    try {
      const response = await axiosInstance.post(
        `/workspaces/${workspaceId}/invite`,
        invitationData
      );
      return {
        data: {
          invitation: response.data.data,
          message: response.data.message,
        },
      };
    } catch (error) {
      throw error;
    }
  },

  // Delete an invitation
  deleteInvitation: async (workspaceId: string, invitationId: string) => {
    try {
      await axiosInstance.delete(`/invitations/${workspaceId}/${invitationId}`);
      return { data: { success: true } };
    } catch (error) {
      throw error;
    }
  },
};
