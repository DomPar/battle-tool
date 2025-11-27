import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
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
    const [saving, setSaving] = useState(false);

    // formulario de creación
    const [form, setForm] = useState({
        name: "",
        hp: "",
        ac: "",
        notes: "",
    });

    // formulario de edición
    const [editing, setEditing] = useState(null); // { id, name, hp, ac, notes }

    useEffect(() => {
        loadCharacters();
    }, []);

    const loadCharacters = async () => {
        try {
            setLoading(true);
            const data = await getAllCharacters();
            setCharacters(data || []);
        } catch (error) {
            console.log("Error cargando personajes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]:
                field === "name" || field === "notes"
                    ? value
                    : value.replace(/[^0-9]/g, ""),
        }));
    };

    const handleCreate = async () => {
        const name = form.name.trim();
        const hpNum = parseInt(form.hp, 10);
        const acNum = parseInt(form.ac, 10);
        const notes = form.notes.trim() || null;

        if (!name || isNaN(hpNum) || isNaN(acNum)) {
            Alert.alert("Campos incompletos", "Nombre, HP y AC son obligatorios.");
            return;
        }

        try {
            setSaving(true);
            const body = {
                name,
                hp: hpNum,
                ac: acNum,
                notes,
            };
            await createCharacter(body);
            setForm({ name: "", hp: "", ac: "", notes: "" });
            await loadCharacters();
        } catch (error) {
            console.log("Error creando personaje:", error);
            Alert.alert("Error", "No se pudo crear el personaje.");
        } finally {
            setSaving(false);
        }
    };

    // ---- borrado real (compartido por web y móvil) ----
    const reallyDeleteCharacter = async (id) => {
        try {
            setSaving(true);
            await deleteCharacter(id);
            setCharacters((prev) => prev.filter((ch) => ch.id !== id));
            if (editing && editing.id === id) setEditing(null);
        } catch (error) {
            console.log("Error eliminando personaje:", error);
            Alert.alert("Error", "No se pudo eliminar el personaje.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id, name) => {
        if (Platform.OS === "web") {
            const confirmed = window.confirm(
                `¿Seguro que quieres eliminar a "${name}"?`
            );
            if (!confirmed) return;
            reallyDeleteCharacter(id);
        } else {
            Alert.alert(
                "Eliminar personaje",
                `¿Seguro que quieres eliminar a "${name}"?`,
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Eliminar",
                        style: "destructive",
                        onPress: () => {
                            reallyDeleteCharacter(id);
                        },
                    },
                ]
            );
        }
    };

    // ----- EDICIÓN -----

    const startEdit = (ch) => {
        setEditing({
            id: ch.id,
            name: ch.name || "",
            hp: String(ch.hp ?? ""),
            ac: String(ch.ac ?? ""),
            notes: ch.notes || "",
        });
    };

    const handleEditChange = (field, value) => {
        setEditing((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                [field]:
                    field === "name" || field === "notes"
                        ? value
                        : value.replace(/[^0-9]/g, ""),
            };
        });
    };

    const handleSaveEdit = async () => {
        if (!editing) return;

        const name = editing.name.trim();
        const hpNum = parseInt(editing.hp, 10);
        const acNum = parseInt(editing.ac, 10);
        const notes = editing.notes.trim() || null;

        if (!name || isNaN(hpNum) || isNaN(acNum)) {
            Alert.alert(
                "Campos incompletos",
                "Nombre, HP y AC son obligatorios para editar."
            );
            return;
        }

        try {
            setSaving(true);
            const body = {
                name,
                hp: hpNum,
                ac: acNum,
                notes,
            };
            await updateCharacter(editing.id, body);
            setEditing(null);
            await loadCharacters();
        } catch (error) {
            console.log("Error actualizando personaje:", error);
            Alert.alert("Error", "No se pudo actualizar el personaje.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>Cargando personajes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Personajes</Text>

            <ScrollView
                style={styles.listArea}
                contentContainerStyle={{ paddingBottom: 12 }}
            >
                {characters.length === 0 ? (
                    <Text style={styles.emptyText}>
                        Aún no tienes personajes creados.
                    </Text>
                ) : (
                    characters.map((ch) => (
                        <View key={ch.id} style={styles.row}>
                            <View style={styles.rowText}>
                                <Text style={styles.name}>{ch.name}</Text>
                                <Text style={styles.stats}>
                                    {ch.hp} HP · AC {ch.ac}
                                </Text>
                                {ch.notes ? (
                                    <Text style={styles.notes}>📝 {ch.notes}</Text>
                                ) : null}
                            </View>

                            <View style={styles.rowButtons}>
                                <Pressable
                                    style={styles.editButton}
                                    onPress={() => startEdit(ch)}
                                >
                                    <Text style={styles.editText}>Editar</Text>
                                </Pressable>

                                <Pressable
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(ch.id, ch.name)}
                                >
                                    <Text style={styles.deleteText}>Eliminar</Text>
                                </Pressable>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* ABAJO: O CREAR O EDITAR, NUNCA LOS DOS A LA VEZ */}
            {saving && (
                <Text style={styles.savingText}>
                    Guardando cambios en personajes...
                </Text>
            )}

            {!editing ? (
                // FORMULARIO CREAR
                <View style={styles.addBox}>
                    <Text style={styles.addTitle}>Crear nuevo personaje</Text>

                    <View style={styles.addRow}>
                        <View style={styles.addFieldLarge}>
                            <Text style={styles.label}>Nombre</Text>
                            <TextInput
                                style={styles.input}
                                value={form.name}
                                onChangeText={(text) => handleChange("name", text)}
                                placeholder="Aelar, Thia, etc."
                                placeholderTextColor="#6b7280"
                            />
                        </View>

                        <View style={styles.addFieldSmall}>
                            <Text style={styles.label}>HP</Text>
                            <TextInput
                                style={styles.input}
                                value={form.hp}
                                onChangeText={(text) => handleChange("hp", text)}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.addFieldSmall}>
                            <Text style={styles.label}>AC</Text>
                            <TextInput
                                style={styles.input}
                                value={form.ac}
                                onChangeText={(text) => handleChange("ac", text)}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Notas (opcional)</Text>
                    <TextInput
                        style={[styles.input, styles.notesInput]}
                        value={form.notes}
                        onChangeText={(text) => handleChange("notes", text)}
                        placeholder="Clase, arma, rasgo especial..."
                        placeholderTextColor="#6b7280"
                        multiline
                    />

                    <Pressable
                        style={styles.addButton}
                        onPress={handleCreate}
                        disabled={saving}
                    >
                        <Text style={styles.addButtonText}>+ Añadir personaje</Text>
                    </Pressable>
                </View>
            ) : (
                // FORMULARIO EDICIÓN
                <View style={styles.editBox}>
                    <Text style={styles.editTitle}>
                        Editar personaje: {editing.name || "Sin nombre"}
                    </Text>

                    <View style={styles.addRow}>
                        <View style={styles.addFieldLarge}>
                            <Text style={styles.label}>Nombre</Text>
                            <TextInput
                                style={styles.input}
                                value={editing.name}
                                onChangeText={(text) => handleEditChange("name", text)}
                                placeholder="Nombre"
                                placeholderTextColor="#6b7280"
                            />
                        </View>

                        <View style={styles.addFieldSmall}>
                            <Text style={styles.label}>HP</Text>
                            <TextInput
                                style={styles.input}
                                value={editing.hp}
                                onChangeText={(text) => handleEditChange("hp", text)}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.addFieldSmall}>
                            <Text style={styles.label}>AC</Text>
                            <TextInput
                                style={styles.input}
                                value={editing.ac}
                                onChangeText={(text) => handleEditChange("ac", text)}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Notas</Text>
                    <TextInput
                        style={[styles.input, styles.notesInput]}
                        value={editing.notes}
                        onChangeText={(text) => handleEditChange("notes", text)}
                        multiline
                    />

                    <View style={styles.editButtonsRow}>
                        <Pressable
                            style={[styles.editActionButton, styles.editCancel]}
                            onPress={() => setEditing(null)}
                            disabled={saving}
                        >
                            <Text style={styles.editActionText}>Cancelar</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.editActionButton, styles.editSave]}
                            onPress={handleSaveEdit}
                            disabled={saving}
                        >
                            <Text style={styles.editActionText}>Guardar cambios</Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#020617",
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    center: {
        flex: 1,
        backgroundColor: "#020617",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        color: "#e5e7eb",
        marginTop: 8,
    },
    title: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },
    listArea: {
        flex: 1,
        marginBottom: 12,
    },
    emptyText: {
        color: "#9ca3af",
        textAlign: "center",
        marginTop: 20,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#0f172a",
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
    },
    rowText: {
        flex: 1,
    },
    name: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
    stats: {
        color: "#e5e7eb",
        fontSize: 13,
        marginTop: 2,
    },
    notes: {
        color: "#9ca3af",
        fontSize: 12,
        marginTop: 4,
    },
    rowButtons: {
        flexDirection: "column",
        gap: 4,
        marginLeft: 8,
    },
    deleteButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#f87171",
        marginTop: 4,
    },
    deleteText: {
        color: "#f87171",
        fontSize: 12,
        fontWeight: "500",
    },
    editButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#38bdf8",
    },
    editText: {
        color: "#38bdf8",
        fontSize: 12,
        fontWeight: "500",
    },

    addBox: {
        borderTopWidth: 1,
        borderTopColor: "#1f2937",
        paddingTop: 10,
        paddingBottom: 8,
    },
    savingText: {
        color: "#a5b4fc",
        textAlign: "center",
        marginBottom: 4,
        fontSize: 12,
    },
    addTitle: {
        color: "#e5e7eb",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    addRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 10,
    },
    addFieldLarge: {
        flex: 1,
    },
    addFieldSmall: {
        width: 70,
    },
    label: {
        color: "#9ca3af",
        fontSize: 12,
        marginBottom: 2,
    },
    input: {
        minHeight: 34,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#4b5563",
        color: "white",
        paddingHorizontal: 6,
        paddingVertical: 4,
        fontSize: 14,
    },
    notesInput: {
        minHeight: 60,
        textAlignVertical: "top",
        marginBottom: 8,
    },
    addButton: {
        backgroundColor: "#4f46e5",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    addButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },

    editBox: {
        borderTopWidth: 1,
        borderTopColor: "#1f2937",
        paddingTop: 10,
        paddingBottom: 12,
        marginTop: 4,
    },
    editTitle: {
        color: "#e5e7eb",
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
    },
    editButtonsRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 8,
    },
    editActionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    editCancel: {
        backgroundColor: "#374151",
    },
    editSave: {
        backgroundColor: "#22c55e",
    },
    editActionText: {
        color: "white",
        fontSize: 13,
        fontWeight: "500",
    },
});
