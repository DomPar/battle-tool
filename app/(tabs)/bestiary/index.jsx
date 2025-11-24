import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function BestiaryListScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bestiario</Text>
            <Text style={styles.subtitle}>
                Aquí irán las criaturas cargadas desde la API.
            </Text>

            <Pressable
                style={styles.button}
                onPress={() => router.push("/(tabs)/bestiary/create")}
            >
                <Text style={styles.buttonText}>Añadir criatura</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
    subtitle: { fontSize: 14, marginBottom: 24, textAlign: "center" },
    button: {
        backgroundColor: "#22c55e",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
    },
    buttonText: { color: "#0f172a", fontWeight: "600", fontSize: 16 },
});
