import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
    const insets = useSafeAreaInsets(); // márgenes seguros (arriba/abajo)

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#6366f1",
                tabBarInactiveTintColor: "#9ca3af",

                tabBarStyle: {
                    backgroundColor: "#020617",
                    borderTopColor: "#1f2937",
                    borderTopWidth: 1,
                    // dejamos sitio por encima de los botones del sistema
                    height: 60 + insets.bottom,
                    paddingTop: 6,
                    paddingBottom: 8 + insets.bottom,
                },

                headerStyle: {
                    backgroundColor: "#020617",
                },
                headerTintColor: "#e5e7eb",
                headerTitleStyle: {
                    fontWeight: "600",
                },

                // opcional: que se oculte al abrir teclado
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tabs.Screen
                name="inicio"
                options={{
                    title: "Inicio",
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ color, fontSize: size }}>🏠</Text>
                    ),
                }}
            />

            <Tabs.Screen
                name="battles"
                options={{
                    title: "Batallas",
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ color, fontSize: size }}>⚔️</Text>
                    ),
                }}
            />

            <Tabs.Screen
                name="characters"
                options={{
                    title: "Personajes",
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ color, fontSize: size }}>🧙‍♂️</Text>
                    ),
                }}
            />

            <Tabs.Screen
                name="bestiary"
                options={{
                    title: "Bestiario",
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ color, fontSize: size }}>🐲</Text>
                    ),
                }}
            />
        </Tabs>
    );
}
