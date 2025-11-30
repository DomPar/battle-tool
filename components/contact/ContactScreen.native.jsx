// components/contact/ContactScreen.native.jsx
import {
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const GITHUB_URL = "https://github.com/tu-usuario"; // cámbialo por el tuyo

const EIFFEL_REGION = {
    latitude: 48.8584,
    longitude: 2.2945,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
};

export default function ContactScreen() {
    const handleOpenGitHub = () => {
        Linking.openURL(GITHUB_URL);
    };

    return (
        <View style={styles.container}>
            <View style={styles.inner}>
                <Text style={styles.title}>Battle Tool</Text>

                <Text style={styles.subtitle}>Contacto</Text>
                <Text style={styles.text}>
                    Esta app es un proyecto personal para gestionar batallas de D&amp;D.
                </Text>

                <Pressable style={styles.githubButton} onPress={handleOpenGitHub}>
                    <Text style={styles.githubButtonText}>Ver mi GitHub</Text>
                </Pressable>

                <Text style={styles.mapLabel}>Ubicación de ejemplo: Torre Eiffel</Text>

                <View style={styles.mapCard}>
                    <MapView style={styles.map} initialRegion={EIFFEL_REGION}>
                        <Marker
                            coordinate={EIFFEL_REGION}
                            title="Torre Eiffel"
                            description="Ubicación de ejemplo para Battle Tool"
                        />
                    </MapView>
                </View>
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
        overflow: "hidden",
    },
    map: {
        flex: 1,
    },
});
