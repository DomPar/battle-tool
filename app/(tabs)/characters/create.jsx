import { StyleSheet, Text, View } from "react-native";

export default function CharacterCreateScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Crear personaje</Text>
            <Text>Aquí pondremos el formulario (nombre, vida, AC...)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
});
