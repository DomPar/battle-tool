import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: "#1e293b" },
                headerTitleStyle: { color: "white", fontSize: 20, fontWeight: "bold" },
                headerTitleAlign: "center",
            }}
        >
            <Tabs.Screen
                name="inicio"
                options={{ title: "Inicio" }}
            />

            <Tabs.Screen
                name="battles"
                options={{ title: "Batallas" }}
            />

            <Tabs.Screen
                name="characters"
                options={{ title: "Personajes" }}
            />

            <Tabs.Screen
                name="bestiary"
                options={{ title: "Bestiario" }}
            />
        </Tabs>
    );
}
