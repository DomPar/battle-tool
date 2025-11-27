import axios from "axios";

const api = axios.create({
    baseURL: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1`,
    headers: {
        apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
    },
});

export default api;
