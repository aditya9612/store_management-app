import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedStoreId: null,
  shopInfo: null
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    setSelectedStore: (state, action) => {
      state.selectedStoreId = action.payload;
    },
    setShopInfo: (state, action) => {
      state.shopInfo = action.payload;
    },
    clearShopData: (state) => {
      state.selectedStoreId = null;
      state.shopInfo = null;
    }
  }
});

export const { setSelectedStore, setShopInfo, clearShopData } = shopSlice.actions;
export default shopSlice.reducer;