import { useRouter } from "expo-router";
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
    createBattle,
    deleteBattle,
    getAllBattles,
    updateBattle,
} from "../../../services/apiService";

export default function BattlesScreen() {
    const router = useRouter();
    const [battles, setBattles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [notes, setNotes] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const [keyboardOffset, setKeyboardOffset] = useState(0);

    useEffect(() => {
        loadBattles();
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

    const loadBattles = async () => {
        try {
            setLoading(true);
            const data = await getAllBattles();
            setBattles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log("Error cargando batallas:", error);
            Alert.alert("Error", "No se pudieron cargar las batallas.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName("");
        setNotes("");
        setEditingId(null);
    };

    const fillFormForEdit = (battle) => {
        setEditingId(battle.id);
        setName(battle.name || "");
        setNotes(battle.notes || "");
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert("Nombre requerido", "La batalla necesita un nombre.");
            return;
        }

        const body = {
            name: name.trim(),
            notes: notes.trim() || null,
        };

        try {
            setSaving(true);
            if (editingId) {
                await updateBattle(editingId, body);
            } else {
                await createBattle({ ...body, combatants: [] });
            }
            resetForm();
            await loadBattles();
        } catch (error) {
            console.log("Error guardando batalla:", error);
            Alert.alert("Error", "No se pudo guardar la batalla.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert("Eliminar", "¿Seguro que quieres eliminar esta batalla?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteBattle(id);
                        if (editingId === id) resetForm();
                        await loadBattles();
                    } catch (error) {
                        console.log("Error eliminando batalla:", error);
                        Alert.alert("Error", "No se pudo eliminar la batalla.");
                    }
                },
            },
        ]);
    };

    return (
        <View style={[styles.container, { paddingBottom: keyboardOffset }]}>
            <View style={styles.inner}>
                <Text style={styles.title}>Batallas</Text>

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
                        {battles.length === 0 ? (
                            <Text style={styles.emptyText}>No hay batallas todavía.</Text>
                        ) : (
                            battles.map((b) => (
                                <View key={b.id} style={styles.battleCard}>
                                    <Pressable
                                        style={{ flex: 1 }}
                                        onPress={() => router.push(`/battles/${b.id}`)}
                                    >
                                        <Text style={styles.battleName}>{b.name}</Text>
                                        {b.notes ? (
                                            <Text style={styles.battleNotes} numberOfLines={2}>
                                                {b.notes}
                                            </Text>
                                        ) : null}
                                    </Pressable>

                                    <View style={styles.cardButtons}>
                                        <Pressable
                                            style={[styles.smallButton, styles.editButton]}
                                            onPress={() => fillFormForEdit(b)}
                                        >
                                            <Text style={styles.smallButtonText}>Editar</Text>
                                        </Pressable>
                                        <Pressable
                                            style={[styles.smallButton, styles.deleteButton]}
                                            onPress={() => handleDelete(b.id)}
                                        >
                                            <Text style={styles.smallButtonText}>X</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}

                {/* Formulario para crear/editar batalla */}
                <View style={styles.form}>
                    <Text style={styles.formTitle}>
                        {editingId ? "Editar batalla" : "Crear nueva batalla"}
                    </Text>

                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Nombre de la batalla"
                        placeholderTextColor="#6b7280"
                    />

                    <Text style={styles.label}>Notas (opcional)</Text>
                    <TextInput
                        style={[styles.input, styles.notesInput]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Notas, contexto, etc."
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
                                        : "+ Crear batalla"}
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
    battleCard: {
        flexDirection: "row",
        backgroundColor: "#0f172a",
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#1f2937",
    },
    battleName: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    battleNotes: {
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
