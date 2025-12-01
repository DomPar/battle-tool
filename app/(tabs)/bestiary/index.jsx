import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    createCreature,
    deleteCreature,
    getAllCreatures,
    updateCreature,
} from "../../../services/apiService";

export default function BestiaryScreen() {
    const [creatures, setCreatures] = useState([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [hp, setHp] = useState("");
    const [ac, setAc] = useState("");
    const [notes, setNotes] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const [keyboardOffset, setKeyboardOffset] = useState(0);

    useEffect(() => {
        loadCreatures();
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

    const loadCreatures = async () => {
        try {
            setLoading(true);
            const data = await getAllCreatures();
            setCreatures(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log("Error cargando criaturas:", error);
            Alert.alert("Error", "No se pudieron cargar las criaturas.");
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

    const fillFormForEdit = (cr) => {
        setEditingId(cr.id);
        setName(cr.name || "");
        setHp(cr.hp?.toString() || "");
        setAc(cr.ac?.toString() || "");
        setNotes(cr.notes || "");
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert("Nombre requerido", "La criatura necesita un nombre.");
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
                await updateCreature(editingId, body);
            } else {
                await createCreature(body);
            }
            resetForm();
            await loadCreatures();
        } catch (error) {
            console.log("Error guardando criatura:", error);
            Alert.alert("Error", "No se pudo guardar la criatura.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {

        if (Platform.OS === "web") {
        const confirmed = confirm("¿Seguro que quieres eliminar esta criatura?");
        if (!confirmed) return;

        try {
            await deleteCreature(id);
            if (editingId === id) resetForm();
            await loadCreatures();
        } catch (error) {
            console.log("Error eliminando criatura:", error);
            alert("No se pudo eliminar la criatura.");
        }
        return;
    }
        Alert.alert("Eliminar", "¿Seguro que quieres eliminar esta criatura?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteCreature(id);
                        if (editingId === id) resetForm();
                        await loadCreatures();
                    } catch (error) {
                        console.log("Error eliminando criatura:", error);
                        Alert.alert("Error", "No se pudo eliminar la criatura.");
                    }
                },
            },
        ]);
    };

    return (
        <View style={[styles.container, { paddingBottom: keyboardOffset }]}>
            <View style={styles.inner}>
                <Text style={styles.title}>Bestiario</Text>

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
                        {creatures.length === 0 ? (
                            <Text style={styles.emptyText}>No hay criaturas todavía.</Text>
                        ) : (
                            creatures.map((cr) => (
                                <View key={cr.id} style={styles.card}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardName}>{cr.name}</Text>
                                        <Text style={styles.cardLine}>
                                            HP: <Text style={styles.hpText}>{cr.hp ?? 0}</Text> · AC:{" "}
                                            <Text style={styles.acText}>{cr.ac ?? 0}</Text>
                                        </Text>
                                        {cr.notes ? (
                                            <Text style={styles.cardNotes} numberOfLines={2}>
                                                {cr.notes}
                                            </Text>
                                        ) : null}
                                    </View>

                                    <View style={styles.cardButtons}>
                                        <Pressable
                                            style={[styles.smallButton, styles.editButton]}
                                            onPress={() => fillFormForEdit(cr)}
                                        >
                                            <Text style={styles.smallButtonText}>Editar</Text>
                                        </Pressable>
                                        <Pressable
                                            style={[styles.smallButton, styles.deleteButton]}
                                            onPress={() => handleDelete(cr.id)}
                                        >
                                            <Text style={styles.smallButtonText}>X</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}

                {/* Formulario para crear/editar criatura*/}
                <View style={styles.form}>
                    <Text style={styles.formTitle}>
                        {editingId ? "Editar criatura" : "Crear criatura"}
                    </Text>

                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Nombre de la criatura"
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
                                        : "Crear criatura"}
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
