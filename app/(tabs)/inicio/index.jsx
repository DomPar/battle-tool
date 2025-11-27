import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function InicioScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.appTitle}>⚔️ Battle Tool</Text>

            <View style={styles.buttonsWrapper}>

                {/* Botón Batallas */}
                <Pressable
                    style={styles.button}
                    onPress={() => router.push("/battles")}
                >
                    <Text style={styles.icon}>⚔️</Text>
                    <Text style={styles.buttonLabel}>Batallas</Text>
                </Pressable>

                {/* Botón Personajes */}
                <Pressable
                    style={styles.button}
                    onPress={() => router.push("/characters")}
                >
                    <Text style={styles.icon}>🧙‍♂️</Text>
                    <Text style={styles.buttonLabel}>Personajes</Text>
                </Pressable>

                {/* Botón Criaturas */}
                <Pressable
                    style={styles.button}
                    onPress={() => router.push("/bestiary")}
                >
                    <Text style={styles.icon}>🐉</Text>
                    <Text style={styles.buttonLabel}>Criaturas</Text>
                </Pressable>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#020617", // azul noche
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },

    appTitle: {
        fontSize: 36,
        color: "white",
        fontWeight: "bold",
        marginBottom: 50,
        letterSpacing: 1,
        textAlign: "center",
    },

    buttonsWrapper: {
        width: "100%",
        gap: 22,
    },

    button: {
        backgroundColor: "#0f172a",
        borderWidth: 2,
        borderColor: "#334155",
        borderRadius: 20,
        paddingVertical: 18,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 6,
    },

    icon: {
        fontSize: 38,
        marginBottom: 6,
    },

    buttonLabel: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
});
