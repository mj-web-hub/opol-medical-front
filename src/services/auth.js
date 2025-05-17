import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email, password) => {
    const response = await api.post('/login', { email, password }); // 👈 POST
    await AsyncStorage.setItem('token', response.data.token);
    return response.data.user;
};

export const logout = async () => {
    await api.post('/logout');
    await AsyncStorage.removeItem('token');
};

export const getUser = async () => {
    const token = await AsyncStorage.getItem('token');
    return token ? (await api.get('/user')).data : null;
};