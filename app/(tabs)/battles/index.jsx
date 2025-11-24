import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function BattlesScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Batallas</Text>

            {/* Aquí irá tu lista de batallas de la API */}

            <Pressable
                style={styles.addButton}
                onPress={() => router.push("/battles/create")}
            >
                <Text style={styles.addButtonText}>+ Crear batalla</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#0f172a" },
    title: {
        fontSize: 32,
        color: "white",
        textAlign: "center",
        marginBottom: 30,
        fontWeight: "bold",
    },
    addButton: {
        backgroundColor: "#3b82f6",
        paddingVertical: 15,
        borderRadius: 999,
        alignItems: "center",
        marginTop: 30,
    },
    addButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});
