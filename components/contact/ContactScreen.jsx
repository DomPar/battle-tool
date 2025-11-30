import {
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const GITHUB_URL = "https://github.com/DomPar/battle-tool"; 
const EIFFEL_MAP_URL = "https://www.google.com/maps?q=48.8584,2.2945";

export default function ContactScreenWeb() {
    const handleOpenGitHub = () => {
        Linking.openURL(GITHUB_URL);
    };

    const handleOpenMap = () => {
        Linking.openURL(EIFFEL_MAP_URL);
    };

    return (
        <View style={styles.container}>
            <View style={styles.inner}>
                <Text style={styles.title}>Battle Tool</Text>
                <Text style={styles.text}>
                    Esta app es un proyecto personal para gestionar batallas de D&amp;D.
                </Text>

                <Pressable style={styles.githubButton} onPress={handleOpenGitHub}>
                    <Text style={styles.githubButtonText}>Ver mi GitHub</Text>
                </Pressable>

                <Text style={styles.mapLabel}>Ubicación de ejemplo: Torre Eiffel</Text>

                <Pressable style={styles.mapCard} onPress={handleOpenMap}>
                    <Text style={styles.mapText}>
                        Abrir mapa de la Torre Eiffel en Google Maps
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#020617",
    },
    inner: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    title: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        color: "#e5e7eb",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
        textAlign: "center",
    },
    text: {
        color: "#9ca3af",
        fontSize: 13,
        textAlign: "center",
        marginBottom: 12,
    },
    githubButton: {
        alignSelf: "center",
        backgroundColor: "#4f46e5",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    githubButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
    mapLabel: {
        color: "#e5e7eb",
        fontSize: 14,
        marginBottom: 8,
    },
    mapCard: {
        flex: 1,
        backgroundColor: "#0f172a",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#1f2937",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        overflow: "hidden",
    },
    mapText: {
        color: "#e5e7eb",
        fontSize: 14,
        textAlign: "center",
    },
});
