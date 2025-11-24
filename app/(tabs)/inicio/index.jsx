import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function InicioScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Battle Tool</Text>

            <Pressable
                style={styles.button}
                onPress={() => router.push("/battles")}
            >
                <Text style={styles.buttonText}>Batallas</Text>
            </Pressable>

            <Pressable
                style={styles.button}
                onPress={() => router.push("/characters")}   // ← OJO: SOLO "/characters"
            >
                <Text style={styles.buttonText}>Personajes</Text>
            </Pressable>

            <Pressable
                style={styles.button}
                onPress={() => router.push("/bestiary")}     // ← y aquí solo "/bestiary"
            >
                <Text style={styles.buttonText}>Criaturas</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 40,
    },
    button: {
        width: 220,
        paddingVertical: 16,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "600",
    },
});
