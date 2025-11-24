import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function CharactersListScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Personajes</Text>
            <Text style={styles.subtitle}>
                Aquí irán los personajes cargados desde la API.
            </Text>

            <Pressable
                style={styles.button}
                onPress={() => router.push("/(tabs)/characters/create")}
            >
                <Text style={styles.buttonText}>Añadir personaje</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
    subtitle: { fontSize: 14, marginBottom: 24, textAlign: "center" },
    button: {
        backgroundColor: "#3b82f6",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
    },
    buttonText: { color: "#ffffff", fontWeight: "600", fontSize: 16 },
});
