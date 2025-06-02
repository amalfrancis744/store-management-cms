import { memberAPI } from '@/api/admin/member-api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Member } from '@/types';

// Async thunks
export const getAllMembers = createAsyncThunk(
  'members/getAllMembers',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await memberAPI.getAllMembers(workspaceId);
      console.log('Fetched members:', response.data.members);
      return response.data.members;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch members'
      );
    }
  }
);

export const removeMember = createAsyncThunk(
  'members/removeMember',
  async (
    { workspaceId, memberId }: { workspaceId: string; memberId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await memberAPI.removeMember(workspaceId, memberId);
      return { memberId, success: response.data.success };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove member'
      );
    }
  }
);

export const updateMember = createAsyncThunk(
  'members/updateMember',
  async (
    {
      workspaceId,
      memberId,
      memberData,
    }: { workspaceId: string; memberId: string; memberData: Partial<Member> },
    { rejectWithValue }
  ) => {
    try {
      const response = await memberAPI.updateMember(
        workspaceId,
        memberId,
        memberData
      );
      return response.data.member;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update member'
      );
    }
  }
);

// State interface
interface MemberState {
  members: Member[];
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  removeLoading: boolean;
}

// Initial state
const initialState: MemberState = {
  members: [],
  loading: false,
  error: null,
  updateLoading: false,
  removeLoading: false,
};

// Slice
const memberSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetMemberState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Get all members
    builder
      .addCase(getAllMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(getAllMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove member
    builder
      .addCase(removeMember.pending, (state) => {
        state.removeLoading = true;
        state.error = null;
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.removeLoading = false;
        if (action.payload.success) {
          state.members = state.members.filter(
            (member) => member.id !== action.payload.memberId
          );
        }
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.removeLoading = false;
        state.error = action.payload as string;
      });

    // Update member
    builder
      .addCase(updateMember.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedMember = action.payload;
        const index = state.members.findIndex(
          (member) => member.id === updatedMember.id
        );
        if (index !== -1) {
          state.members[index] = updatedMember;
        }
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearError, resetMemberState } = memberSlice.actions;
export default memberSlice.reducer;

// Selectors
export const selectMembers = (state: { members: MemberState }) =>
  state.members.members;
export const selectMembersLoading = (state: { members: MemberState }) =>
  state.members.loading;
export const selectMembersError = (state: { members: MemberState }) =>
  state.members.error;
export const selectUpdateLoading = (state: { members: MemberState }) =>
  state.members.updateLoading;
export const selectRemoveLoading = (state: { members: MemberState }) =>
  state.members.removeLoading;
