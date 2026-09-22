import { combineReducers } from '@reduxjs/toolkit'
import { apiSlice } from './apiSlice'
import UserReducer from './user/index';
import I18nReducer from './i18n/i18nSlice';

export const rootReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
    user: UserReducer,
    i18n: I18nReducer,
})