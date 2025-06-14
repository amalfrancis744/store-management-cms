import { configureStore, combineReducers, Action } from '@reduxjs/toolkit';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import workspaceReducer from './slices/admin/workspaceSlice';
import categoryReducer from './slices/admin/categorySlice';
import productReducer from './slices/admin/productSlice';
import storesReducer from './slices/customer/userStoresSlice';
import userCategoryProductReducer from './slices/customer/userStoreCategoryProductSlice';
import cartReducer from './slices/customer/cartSlice';
import orderReducer from './slices/customer/orderSlice';
import userProfileReducer from './slices/customer/userProfileSlice';
import customerOrderReducer from './slices/manager/customerOrderSlice';
import socketReducer from './slices/socket/socketSlice';
import notificationReducer from './slices/notification/notificationSlice';
import staffReducer from './slices/staff/staffSlice';
import adminDashboardReducer from './slices/admin/adminDashboardSlice';
import memberReducer from './slices/admin/memberSlice';
import staffManageReducer from './slices/manager/staffManageSlice';

import { ThunkAction } from 'redux-thunk';
import socketMiddleware from '@/middleware/socketMiddleware';

// Define a reset action type
export const RESET_STATE = 'RESET_STATE';

interface ResetAction {
  type: typeof RESET_STATE;
}

// Persist config for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user'],
};

// Persist config for workspace
const workspacePersistConfig = {
  key: 'workspace',
  storage,
  whitelist: ['workspaces', 'activeWorkspace'],
};

// Persist config for category
const categoryPersistConfig = {
  key: 'category',
  storage,
  whitelist: ['categories'],
};

// Persist config for product
const productPersistConfig = {
  key: 'product',
  storage,
  whitelist: ['products', 'productsByCategory'],
};

// Persist config for stores
const storesPersistConfig = {
  key: 'stores',
  storage,
  whitelist: ['stores', 'activeStore', 'filters'],
};

// Persist config for userCategoryProduct
const userCategoryProductPersistConfig = {
  key: 'userCategoryProduct',
  storage,
  whitelist: ['categories'],
};

// Persist config for cart
const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items', 'isOpen'],
};

// Persist config for orders
const orderPersistConfig = {
  key: 'orders',
  storage,
  whitelist: ['orders', 'currentOrder', 'status'],
};

// Persist config for userProfile
const userProfilePersistConfig = {
  key: 'userProfile',
  storage,
  whitelist: ['profile'],
};

const customerOrderPersistConfig = {
  key: 'customerOrder',
  storage,
  whitelist: ['orders', 'currentOrder', 'status'],
};
const socketPersistConfig = {
  key: 'socket',
  storage,
  // Only persist notifications, not connection state
  whitelist: ['notifications', 'unreadCount'],
};

// Persist config for notifications
const notificationPersistConfig = {
  key: 'notification',
  storage,
  whitelist: ['permission', 'fcmToken'], // Persist these fields
};

// Persist config for staff
const staffPersistConfig = {
  key: 'staff',
  storage,
  // Only persist selected order and last fetched workspace ID
  whitelist: ['selectedOrder', 'lastFetchedWorkspaceId'],
};

// Persist config for admin dashboard
const adminDashboardPersistConfig = {
  key: 'adminDashboard',
  storage,
  whitelist: ['data', 'lastFetchTime'], // Persist only the data field
};

const staffManagePersistConfig = {
  key: 'staffManage',
  storage,
  whitelist: ['staff', 'loading', 'error'],
};

// Persist config for member

const memberPersistConfig = {
  key: 'member',
  storage,
  whitelist: ['members', 'activeMember'], // Persist only members and activeMember
};
// Wrap reducers with persistReducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedWorkspaceReducer = persistReducer(
  workspacePersistConfig,
  workspaceReducer
);
const persistedCategoryReducer = persistReducer(
  categoryPersistConfig,
  categoryReducer
);
const persistedProductReducer = persistReducer(
  productPersistConfig,
  productReducer
);
const persistedStoresReducer = persistReducer(
  storesPersistConfig,
  storesReducer
);
const persistedUserCategoryProductReducer = persistReducer(
  userCategoryProductPersistConfig,
  userCategoryProductReducer
);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);
const persistedOrderReducer = persistReducer(orderPersistConfig, orderReducer);
const persistedUserProfileReducer = persistReducer(
  userProfilePersistConfig,
  userProfileReducer
);
const persistedCustomerOrderReducer = persistReducer(
  customerOrderPersistConfig,
  customerOrderReducer
);

const persistedSocketReducer = persistReducer(
  socketPersistConfig,
  socketReducer
);
const persistedNotificationReducer = persistReducer(
  notificationPersistConfig,
  notificationReducer
);

const persistedStaffReducer = persistReducer(staffPersistConfig, staffReducer);

const persistedAdminDashboardReducer = persistReducer(
  adminDashboardPersistConfig,
  adminDashboardReducer
);

const persistedMemberReducer = persistReducer(
  memberPersistConfig,
  memberReducer
);
const persistedStaffManageReducer = persistReducer(
  staffManagePersistConfig,
  staffManageReducer
);

// Combine all reducers
const appReducer = combineReducers({
  auth: persistedAuthReducer,
  workspace: persistedWorkspaceReducer,
  category: persistedCategoryReducer,
  product: persistedProductReducer,
  stores: persistedStoresReducer,
  usercategoryproduct: persistedUserCategoryProductReducer,
  cart: persistedCartReducer,
  orders: persistedOrderReducer,
  userProfile: persistedUserProfileReducer,
  customerOrder: persistedCustomerOrderReducer,
  socket: persistedSocketReducer,
  notification: persistedNotificationReducer,
  staff: persistedStaffReducer,
  adminDashboard: persistedAdminDashboardReducer,
  members: persistedMemberReducer,
  staffManage: persistedStaffManageReducer,
});

// Root reducer with reset functionality
const rootReducer = (state: any, action: any) => {
  // Clear all redux state when logout action is dispatched
  if (action.type === 'auth/logout/fulfilled') {
    // Reset state for all reducers
    storage.removeItem('persist:auth');
    storage.removeItem('persist:workspace');
    storage.removeItem('persist:category');
    storage.removeItem('persist:product');
    storage.removeItem('persist:stores');
    storage.removeItem('persist:userCategoryProduct');
    storage.removeItem('persist:cart');
    storage.removeItem('persist:orders');
    storage.removeItem('persist:userProfile');
    storage.removeItem('persist:customerOrder');
    storage.removeItem('persist:socket');
    storage.removeItem('persist:staff');

    storage.removeItem('persist:notification');
    storage.removeItem('persist:adminDashboard');
    storage.removeItem('persist:member');
    storage.removeItem('persist:staffManage');

    // Return undefined to let the reducers return their initial state
    state = undefined;
  }

  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
        ],
      },
    }).concat(socketMiddleware),
  devTools: true,
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
