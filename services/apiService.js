import api from "./api";

export const getAllBattles = async () => {
    try {
        const { data } = await api.get("/battles");
        return data;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const getBattle = async (id) => {
    try {
        const { data } = await api.get(`/battles?id=eq.${id}`);
        return data[0] || null;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const createBattle = async (body) => {
    try {
        const { data } = await api.post("/battles", body);
        return data[0] || null;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const updateBattle = async (id, body) => {
    try {
        const { data } = await api.patch(`/battles?id=eq.${id}`, body);
        return data[0] || null;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const deleteBattle = async (id) => {
    try {
        const { data } = await api.delete(`/battles?id=eq.${id}`);
        return data;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const getAllCharacters = async () => {
    try {
        const { data } = await api.get("/characters");
        return data;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const getCharacter = async (id) => {
    try {
        const { data } = await api.get(`/characters?id=eq.${id}`);
        return data[0] || null;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const createCharacter = async (body) => {
    try {
        const { data } = await api.post("/characters", body);
        return data[0] || null;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const updateCharacter = async (id, body) => {
    try {
        const { data } = await api.patch(`/characters?id=eq.${id}`, body);
        return data[0] || null;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const deleteCharacter = async (id) => {
    try {
        const { data } = await api.delete(`/characters?id=eq.${id}`);
        return data;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const getAllCreatures = async () => {
    try {
        const { data } = await api.get("/creatures");
        return data;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const getCreature = async (id) => {
    try {
        const { data } = await api.get(`/creatures?id=eq.${id}`);
        return data[0] || null;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const createCreature = async (body) => {
    try {
        const { data } = await api.post("/creatures", body);
        return data[0] || null;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const updateCreature = async (id, body) => {
    try {
        const { data } = await api.patch(`/creatures?id=eq.${id}`, body);
        return data[0] || null;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};

export const deleteCreature = async (id) => {
    try {
        const { data } = await api.delete(`/creatures?id=eq.${id}`);
        return data;
    } catch (error) {
        console.log(error.response?.data || error);
    }
};
