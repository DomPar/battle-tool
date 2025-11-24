import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

export default function BattleSheetScreen() {
    const { battleId } = useLocalSearchParams();

    // Batalla empieza SIN combatientes
    const [battle, setBattle] = useState({
        id: battleId,
        name: "Batalla sin nombre",
        combatants: [],
    });

    // Formulario para añadir un nuevo combatiente
    const [newCombatant, setNewCombatant] = useState({
        name: "",
        hpBase: "",
        initiative: "",
    });

    // Combatientes ordenados por iniciativa
    const sorted = [...battle.combatants].sort(
        (a, b) => b.initiative - a.initiative
    );

    // Actualizar el valor del input por combatiente (daño/curación)
    const updateAmount = (id, text) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        setBattle((prev) => ({
            ...prev,
            combatants: prev.combatants.map((c) =>
                c.id === id ? { ...c, amount: cleaned } : c
            ),
        }));
    };

    // Aplicar daño/curación a un combatiente (+/-)
    const applyAmount = (id, direction) => {
        setBattle((prev) => ({
            ...prev,
            combatants: prev.combatants.map((c) => {
                if (c.id !== id) return c;

                const raw = c.amount?.trim() ?? "";
                if (!raw) return c;

                const value = parseInt(raw, 10);
                if (isNaN(value) || value === 0) return c;

                const delta = direction === "plus" ? value : -value;
                const newHP = c.hpCurrent + delta;

                return {
                    ...c,
                    hpCurrent: Math.max(0, Math.min(c.hpBase, newHP)),
                    amount: "", // vaciar input tras aplicar
                };
            }),
        }));
    };

    // Añadir un nuevo combatiente a la batalla
    const addCombatant = () => {
        const name = newCombatant.name.trim();
        const hpBaseNum = parseInt(newCombatant.hpBase, 10);
        const initiativeNum = parseInt(newCombatant.initiative, 10);

        if (!name || isNaN(hpBaseNum) || isNaN(initiativeNum)) {
            // aquí podrías poner un Alert más adelante
            return;
        }

        const newOne = {
            id: `c-${Date.now()}-${Math.random().toString(16).slice(2)}`, // id único simple
            name,
            hpBase: hpBaseNum,
            hpCurrent: hpBaseNum, // empieza a tope
            ac: null, // ya lo completaremos cuando venga de la API
            initiative: initiativeNum,
            amount: "",
        };

        setBattle((prev) => ({
            ...prev,
            combatants: [...prev.combatants, newOne],
        }));

        // Resetear formulario
        setNewCombatant({
            name: "",
            hpBase: "",
            initiative: "",
        });
    };

    const renderCombatant = ({ item }) => {
        const isDead = item.hpCurrent === 0;

        return (
            <View style={[styles.row, isDead && styles.deadRow]}>
                <Text style={[styles.initiative, isDead && styles.deadText]}>
                    {item.initiative}
                </Text>

                <View style={styles.nameCol}>
                    <Text style={[styles.name, isDead && styles.deadText]}>
                        {item.name}
                    </Text>
                    <Text style={[styles.hpInfo, isDead && styles.deadText]}>
                        {item.hpCurrent} / {item.hpBase} HP
                    </Text>
                </View>

                <View style={styles.controls}>
                    <Pressable
                        style={[styles.hpButton, styles.hpButtonMinus]}
                        onPress={() => applyAmount(item.id, "minus")}
                    >
                        <Text style={styles.hpButtonText}>-</Text>
                    </Pressable>

                    <TextInput
                        style={[styles.input, isDead && styles.deadInput]}
                        value={item.amount ?? ""}
                        onChangeText={(text) => updateAmount(item.id, text)}
                        keyboardType="numeric"
                    />

                    <Pressable
                        style={[styles.hpButton, styles.hpButtonPlus]}
                        onPress={() => applyAmount(item.id, "plus")}
                    >
                        <Text style={styles.hpButtonText}>+</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{battle.name}</Text>

            {/* LISTA DE COMBATIENTES */}
            {sorted.length === 0 ? (
                <Text style={styles.emptyText}>
                    Aún no hay combatientes en esta batalla.
                </Text>
            ) : (
                <FlatList
                    data={sorted}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCombatant}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            {/* FORMULARIO PARA AÑADIR UN NUEVO COMBATIENTE */}
            <View style={styles.addBox}>
                <Text style={styles.addTitle}>Añadir combatiente</Text>

                <View style={styles.addRow}>
                    <View style={styles.addField}>
                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            style={styles.addInput}
                            value={newCombatant.name}
                            onChangeText={(text) =>
                                setNewCombatant((prev) => ({ ...prev, name: text }))
                            }
                            placeholder="Aelar, Bandido..."
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    <View style={styles.addFieldSmall}>
                        <Text style={styles.label}>HP máx</Text>
                        <TextInput
                            style={styles.addInput}
                            value={newCombatant.hpBase}
                            onChangeText={(text) =>
                                setNewCombatant((prev) => ({
                                    ...prev,
                                    hpBase: text.replace(/[^0-9]/g, ""),
                                }))
                            }
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.addFieldSmall}>
                        <Text style={styles.label}>Init</Text>
                        <TextInput
                            style={styles.addInput}
                            value={newCombatant.initiative}
                            onChangeText={(text) =>
                                setNewCombatant((prev) => ({
                                    ...prev,
                                    initiative: text.replace(/[^0-9]/g, ""),
                                }))
                            }
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <Pressable style={styles.addButton} onPress={addCombatant}>
                    <Text style={styles.addButtonText}>+ Añadir a la batalla</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0f172a", padding: 15 },
    title: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
    },

    emptyText: {
        color: "#e5e7eb",
        textAlign: "center",
        marginBottom: 16,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderRadius: 8,
        backgroundColor: "#1e293b",
        marginBottom: 10,
    },

    deadRow: {
        backgroundColor: "#020617",
        opacity: 0.7,
    },

    initiative: {
        color: "white",
        width: 40,
        fontSize: 18,
        fontWeight: "bold",
    },

    nameCol: {
        flex: 1,
    },
    name: {
        color: "white",
        fontSize: 18,
        fontWeight: "500",
    },
    hpInfo: {
        color: "#e5e7eb",
        fontSize: 14,
        marginTop: 2,
    },

    controls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    input: {
        width: 45,
        height: 32,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#64748b",
        color: "white",
        textAlign: "center",
        paddingVertical: 0,
        paddingHorizontal: 4,
        fontSize: 14,
    },

    deadInput: {
        borderColor: "#4b5563",
    },

    deadText: {
        color: "#6b7280",
    },

    hpButton: {
        width: 32,
        height: 32,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    hpButtonPlus: {
        backgroundColor: "#16a34a",
    },
    hpButtonMinus: {
        backgroundColor: "#dc2626",
    },
    hpButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },

    // Zona de añadir combatiente
    addBox: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#334155",
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
    addField: {
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
    addInput: {
        height: 34,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#64748b",
        color: "white",
        paddingHorizontal: 6,
        fontSize: 14,
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
});
