import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    createCharacter,
    deleteCharacter,
    getAllCharacters,
    updateCharacter,
} from "../../../services/apiService";

export default function CharactersScreen() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [hp, setHp] = useState("");
    const [ac, setAc] = useState("");
    const [notes, setNotes] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const [keyboardOffset, setKeyboardOffset] = useState(0);

    useEffect(() => {
        loadCharacters();
    }, []);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
            setKeyboardOffset(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardOffset(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const loadCharacters = async () => {
        try {
            setLoading(true);
            const data = await getAllCharacters();
            setCharacters(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log("Error cargando personajes:", error);
            Alert.alert("Error", "No se pudieron cargar los personajes.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName("");
        setHp("");
        setAc("");
        setNotes("");
        setEditingId(null);
    };

    const fillFormForEdit = (ch) => {
        setEditingId(ch.id);
        setName(ch.name || "");
        setHp(ch.hp?.toString() || "");
        setAc(ch.ac?.toString() || "");
        setNotes(ch.notes || "");
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert("Nombre requerido", "El personaje necesita un nombre.");
            return;
        }

        const body = {
            name: name.trim(),
            hp: hp ? parseInt(hp, 10) : 0,
            ac: ac ? parseInt(ac, 10) : 0,
            notes: notes.trim() || null,
        };

        try {
            setSaving(true);
            if (editingId) {
                await updateCharacter(editingId, body);
            } else {
                await createCharacter(body);
            }
            resetForm();
            await loadCharacters();
        } catch (error) {
            console.log("Error guardando personaje:", error);
            Alert.alert("Error", "No se pudo guardar el personaje.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert("Eliminar", "¿Seguro que quieres eliminar este personaje?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteCharacter(id);
                        if (editingId === id) resetForm();
                        await loadCharacters();
                    } catch (error) {
                        console.log("Error eliminando personaje:", error);
                        Alert.alert("Error", "No se pudo eliminar el personaje.");
                    }
                },
            },
        ]);
    };

    return (
        <View style={[styles.container, { paddingBottom: keyboardOffset }]}>
            <View style={styles.inner}>
                <Text style={styles.title}>Personajes</Text>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color="#fff" />
                        <Text style={styles.loadingText}>Cargando...</Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        {characters.length === 0 ? (
                            <Text style={styles.emptyText}>No hay personajes todavía.</Text>
                        ) : (
                            characters.map((ch) => (
                                <View key={ch.id} style={styles.card}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardName}>{ch.name}</Text>
                                        <Text style={styles.cardLine}>
                                            HP: <Text style={styles.hpText}>{ch.hp ?? 0}</Text> · AC:{" "}
                                            <Text style={styles.acText}>{ch.ac ?? 0}</Text>
                                        </Text>
                                        {ch.notes ? (
                                            <Text style={styles.cardNotes} numberOfLines={2}>
                                                {ch.notes}
                                            </Text>
                                        ) : null}
                                    </View>

                                    <View style={styles.cardButtons}>
                                        <Pressable
                                            style={[styles.smallButton, styles.editButton]}
                                            onPress={() => fillFormForEdit(ch)}
                                        >
                                            <Text style={styles.smallButtonText}>Editar</Text>
                                        </Pressable>
                                        <Pressable
                                            style={[styles.smallButton, styles.deleteButton]}
                                            onPress={() => handleDelete(ch.id)}
                                        >
                                            <Text style={styles.smallButtonText}>X</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}

                {/* Formulario para crear/editar personajes. */}
                <View style={styles.form}>
                    <Text style={styles.formTitle}>
                        {editingId ? "Editar personaje" : "Crear personaje"}
                    </Text>

                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Nombre del personaje"
                        placeholderTextColor="#6b7280"
                    />

                    <View style={styles.row}>
                        <View style={styles.fieldHalf}>
                            <Text style={styles.label}>HP</Text>
                            <TextInput
                                style={styles.input}
                                value={hp}
                                onChangeText={(t) => setHp(t.replace(/[^0-9]/g, ""))}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.fieldHalf}>
                            <Text style={styles.label}>AC</Text>
                            <TextInput
                                style={styles.input}
                                value={ac}
                                onChangeText={(t) => setAc(t.replace(/[^0-9]/g, ""))}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Notas</Text>
                    <TextInput
                        style={[styles.input, styles.notesInput]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Notas opcionales"
                        placeholderTextColor="#6b7280"
                        multiline
                    />

                    <View style={styles.formButtons}>
                        <Pressable
                            style={styles.saveButton}
                            onPress={handleSubmit}
                            disabled={saving}
                        >
                            <Text style={styles.saveButtonText}>
                                {saving
                                    ? "Guardando..."
                                    : editingId
                                        ? "Guardar cambios"
                                        : "Crear personaje"}
                            </Text>
                        </Pressable>

                        {editingId && (
                            <Pressable style={styles.cancelButton} onPress={resetForm}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </Pressable>
                        )}
                    </View>
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
    scroll: {
        flex: 1,
        marginBottom: 12,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        color: "#e5e7eb",
        marginTop: 8,
    },
    title: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },
    emptyText: {
        color: "#9ca3af",
        textAlign: "center",
        marginTop: 12,
    },
    card: {
        flexDirection: "row",
        backgroundColor: "#0f172a",
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#1f2937",
    },
    cardName: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    cardLine: {
        color: "#e5e7eb",
        fontSize: 13,
        marginBottom: 2,
    },
    hpText: {
        color: "#22c55e",
    },
    acText: {
        color: "#f97316",
    },
    cardNotes: {
        color: "#9ca3af",
        fontSize: 12,
    },
    cardButtons: {
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 4,
        marginLeft: 8,
    },
    smallButton: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    smallButtonText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
    },
    editButton: {
        backgroundColor: "#4b5563",
    },
    deleteButton: {
        backgroundColor: "#b91c1c",
    },

    form: {
        borderTopWidth: 1,
        borderTopColor: "#1f2937",
        paddingTop: 10,
        paddingBottom: 12,
    },
    formTitle: {
        color: "#e5e7eb",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    label: {
        color: "#9ca3af",
        fontSize: 12,
        marginBottom: 2,
    },
    input: {
        borderWidth: 1,
        borderColor: "#4b5563",
        borderRadius: 8,
        color: "white",
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        marginBottom: 8,
    },
    notesInput: {
        minHeight: 60,
        textAlignVertical: "top",
    },
    row: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 4,
    },
    fieldHalf: {
        flex: 1,
    },
    formButtons: {
        flexDirection: "row",
        gap: 8,
        marginTop: 4,
    },
    saveButton: {
        flex: 1,
        backgroundColor: "#4f46e5",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
    },
    saveButtonText: {
        color: "white",
        fontWeight: "600",
    },
    cancelButton: {
        backgroundColor: "#374151",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "white",
        fontWeight: "500",
    },
});
