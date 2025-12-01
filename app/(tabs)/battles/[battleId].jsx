import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    getAllCharacters,
    getAllCreatures,
    getBattle,
    updateBattle,
} from "../../../services/apiService";

export default function BattleDetailScreen() {
    const { battleId } = useLocalSearchParams();
    const numericId = Number(battleId);

    const [battle, setBattle] = useState(null);
    const [combatants, setCombatants] = useState([]);
    const [characters, setCharacters] = useState([]);
    const [creatures, setCreatures] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [keyboardOffset, setKeyboardOffset] = useState(0);

    const [amountInputs, setAmountInputs] = useState({});

    const [fromType, setFromType] = useState("character");
    const [selectedId, setSelectedId] = useState("");
    const [formHpMax, setFormHpMax] = useState("");
    const [formInit, setFormInit] = useState("");
    const [formNameOverride, setFormNameOverride] = useState(""); 

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const panelAnim = useRef(new Animated.Value(0)).current; 

    const translateY = panelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [260, 0], 
    });

    const togglePanel = () => {
        const toValue = isPanelOpen ? 0 : 1;
        setIsPanelOpen(!isPanelOpen);
        Animated.timing(panelAnim, {
            toValue,
            duration: 260,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start();
    };

    // Ajustar offset cuando se muestra/oculta el teclado.

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

    // Cargar datos de la batalla

    useEffect(() => {
        loadData();
    }, [numericId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [battleData, chars, beasts] = await Promise.all([
                getBattle(numericId),
                getAllCharacters(),
                getAllCreatures(),
            ]);

            const b = Array.isArray(battleData) ? battleData[0] : battleData;
            setBattle(b || null);

            const initialCombatants = Array.isArray(b?.combatants)
                ? b.combatants.slice().sort((a, b) => b.initiative - a.initiative)
                : [];

            setCombatants(initialCombatants);
            setCharacters(chars || []);
            setCreatures(beasts || []);
        } catch (error) {
            console.log("Error cargando batalla:", error);
            Alert.alert("Error", "No se pudo cargar la batalla.");
        } finally {
            setLoading(false);
        }
    };

    const saveCombatants = async (updated) => {
        if (!battle) return;

        try {
            setSaving(true);
            await updateBattle(battle.id, {
                name: battle.name,
                notes: battle.notes,
                combatants: updated,
            });
            setCombatants(updated);
        } catch (error) {
            console.log("Error guardando batalla:", error);
            Alert.alert("Error", "No se pudieron guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    // Manejar cambios en los inputs y aplicar cambios de HP/Temp HP

    const handleAmountChange = (id, value) => {
        setAmountInputs((prev) => ({
            ...prev,
            [id]: value.replace(/[^0-9]/g, ""),
        }));
    };

    const applyChange = (id, mode) => {
        // mode: "heal" | "damage" | "temp"
        const raw = amountInputs[id] || "";
        if (!raw) return;

        const amount = parseInt(raw, 10);
        if (isNaN(amount) || amount <= 0) return;

        const updated = combatants.map((c) => {
            if (c.internalId !== id) return c;

            let hpCurrent = c.hpCurrent ?? c.hpMax;
            let tempHp = c.tempHp ?? 0;

            if (mode === "temp") {
                // sumar puntos de golpe temporales
                tempHp += amount;
            } else if (mode === "damage") {
                
                let remaining = amount; // daño primero contra temporales

                if (tempHp > 0) {
                    const used = Math.min(tempHp, remaining);
                    tempHp -= used;
                    remaining -= used;
                }

                if (remaining > 0) {
                    hpCurrent = Math.max(0, hpCurrent - remaining);
                }
            } else if (mode === "heal") {
                hpCurrent = Math.min(c.hpMax, hpCurrent + amount);
            }

            const isDead = hpCurrent <= 0;

            return {
                ...c,
                hpCurrent,
                tempHp,
                isDead,
            };
        });

        setAmountInputs((prev) => ({ ...prev, [id]: "" }));
        saveCombatants(updated);
    };

    // Añadir un nuevo combatiente a la batalla
    const handleAddCombatant = async () => {
        const list = fromType === "character" ? characters : creatures;
        const srcIdNum = parseInt(selectedId, 10);
        const src = list.find((x) => x.id === srcIdNum);

        if (!src) {
            Alert.alert("Selecciona", "Elige un personaje o criatura.");
            return;
        }

        const hpBase = src.hp ?? 0;
        const hpMax = formHpMax ? parseInt(formHpMax, 10) : hpBase;
        const initiative = formInit ? parseInt(formInit, 10) : 0;

        if (isNaN(hpMax) || isNaN(initiative)) {
            Alert.alert("Datos inválidos", "HP y iniciativa deben ser números.");
            return;
        }

        const internalId = Date.now() + Math.random();

        // Nombre que se verá en la batalla:
        const displayName =
            fromType === "creature" && formNameOverride.trim().length > 0
                ? formNameOverride.trim()
                : src.name;

        const newCombatant = {
            internalId, 
            sourceId: src.id,
            sourceType: fromType, 
            name: displayName,
            hpMax,
            hpCurrent: hpMax,
            tempHp: 0,
            ac: src.ac ?? 0,
            initiative,
            notes: src.notes ?? null, 
            isDead: false,
        };

        const updated = [...combatants, newCombatant].sort(
            (a, b) => b.initiative - a.initiative
        );

        setSelectedId("");
        setFormHpMax("");
        setFormInit("");
        setFormNameOverride("");
        setAmountInputs((prev) => ({ ...prev, [internalId]: "" }));

        await saveCombatants(updated);
    };


    if (loading || !battle) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>Cargando batalla...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingBottom: keyboardOffset }]}>
            {/* Lista de los combatientes, pnatalla principal */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: 190 }}
            >
                <View style={styles.header}>
                    <Text style={styles.battleName}>{battle.name}</Text>
                    {battle.notes ? (
                        <Text style={styles.battleNotes}>{battle.notes}</Text>
                    ) : null}
                </View>

                {combatants.length === 0 ? (
                    <Text style={styles.emptyText}>
                        Aún no hay combatientes en esta batalla.
                    </Text>
                ) : (
                    combatants.map((c) => {
                        const isCharacter = c.sourceType === "character";
                        return (
                            <View
                                key={c.internalId}
                                style={[
                                    styles.combatRow,
                                    c.isDead && { opacity: 0.4, backgroundColor: "#111827" },
                                ]}
                            >
                                <View style={styles.leftBlock}>
                                    <View style={styles.initiativeBadge}>
                                        <Text style={styles.initiativeText}>{c.initiative}</Text>
                                    </View>
                                    <View style={styles.mainText}>
                                        <Text style={styles.combatName}>{c.name}</Text>
                                        <Text style={styles.combatStats}>
                                            <Text style={styles.acText}>AC {c.ac}</Text>
                                            <Text style={styles.grayText}> · </Text>
                                            <Text style={styles.hpText}>
                                                {c.hpCurrent} / {c.hpMax} HP
                                            </Text>
                                            {c.tempHp > 0 && (
                                                <Text style={styles.tempHpText}>
                                                    {" "}
                                                    (+{c.tempHp})
                                                </Text>
                                            )}
                                        </Text>
                                    </View>
                                </View>

                                {/* Input para sumar y restar los puntos de salud */}
                                {!isCharacter && (
                                    <View style={styles.rightBlock}>
                                        <Pressable
                                            style={[styles.hpButton, styles.damageButton]}
                                            onPress={() => applyChange(c.internalId, "damage")}
                                        >
                                            <Text style={styles.hpButtonText}>-</Text>
                                        </Pressable>

                                        <TextInput
                                            style={styles.amountInput}
                                            value={amountInputs[c.internalId] || ""}
                                            onChangeText={(text) =>
                                                handleAmountChange(c.internalId, text)
                                            }
                                            keyboardType="numeric"
                                            placeholder="X"
                                            placeholderTextColor="#6b7280"
                                        />

                                        <Pressable
                                            style={[styles.hpButton, styles.healButton]}
                                            onPress={() => applyChange(c.internalId, "heal")}
                                        >
                                            <Text style={styles.hpButtonText}>+</Text>
                                        </Pressable>

                                        <Pressable
                                            style={[styles.hpButton, styles.tempButton]}
                                            onPress={() => applyChange(c.internalId, "temp")}
                                        >
                                            <Text style={styles.hpButtonText}>🛡</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Formulario para añadir a la batalla */}
            <View style={[styles.footer, { bottom: keyboardOffset }]}>
                <Animated.View
                    style={[
                        styles.addPanel,
                        {
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    {saving && (
                        <Text style={styles.savingText}>
                            Guardando cambios en la batalla...
                        </Text>
                    )}

                    <View style={styles.fromRow}>
                        <Pressable
                            style={[
                                styles.fromChip,
                                fromType === "character" && styles.fromChipActive,
                            ]}
                            onPress={() => {
                                setFromType("character");
                                setFormNameOverride("");
                            }}
                        >
                            <Text
                                style={[
                                    styles.fromChipText,
                                    fromType === "character" && styles.fromChipTextActive,
                                ]}
                            >
                                Personajes
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.fromChip,
                                fromType === "creature" && styles.fromChipActive,
                            ]}
                            onPress={() => {
                                setFromType("creature");
                                if (selectedId) {
                                    const cr = creatures.find(
                                        (c) => c.id === parseInt(selectedId, 10)
                                    );
                                    setFormNameOverride(cr?.name || "");
                                }
                            }}
                        >
                            <Text
                                style={[
                                    styles.fromChipText,
                                    fromType === "creature" && styles.fromChipTextActive,
                                ]}
                            >
                                Criaturas
                            </Text>
                        </Pressable>
                    </View>

                    {/* Lista de personajes y criaturas para añadir a la batalla */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.chipsScroll}
                    >
                        {(fromType === "character" ? characters : creatures).map((item) => (
                            <Pressable
                                key={item.id}
                                style={[
                                    styles.nameChip,
                                    selectedId === String(item.id) && styles.nameChipActive,
                                ]}
                                onPress={() => {
                                    setSelectedId(String(item.id));
                                    setFormHpMax(String(item.hp ?? ""));
                                    if (fromType === "creature") {
                                        setFormNameOverride(item.name || "");
                                    } else {
                                        setFormNameOverride("");
                                    }
                                }}
                            >
                                <Text
                                    style={[
                                        styles.nameChipText,
                                        selectedId === String(item.id) &&
                                        styles.nameChipTextActive,
                                    ]}
                                >
                                    {item.name}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>

                    {/* Nombre de criatura en la batalla, para cuando haya mas de uno del mismo tipo. */}
                    {fromType === "creature" && (
                        <View style={{ marginBottom: 8 }}>
                            <Text style={styles.label}>
                                Nombre en esta batalla (opcional)
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={formNameOverride}
                                onChangeText={setFormNameOverride}
                                placeholder="Ej: Bandido 1, Guardián, Lobo A..."
                                placeholderTextColor="#6b7280"
                            />
                        </View>
                    )}

                    <View style={styles.inputsRow}>
                        <View style={styles.fieldSmall}>
                            <Text style={styles.label}>HP máx.</Text>
                            <TextInput
                                style={styles.input}
                                value={formHpMax}
                                onChangeText={(t) => setFormHpMax(t.replace(/[^0-9]/g, ""))}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.fieldSmall}>
                            <Text style={styles.label}>Iniciativa</Text>
                            <TextInput
                                style={styles.input}
                                value={formInit}
                                onChangeText={(t) => setFormInit(t.replace(/[^0-9]/g, ""))}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <Pressable
                        style={styles.addButton}
                        onPress={handleAddCombatant}
                        disabled={saving}
                    >
                        <Text style={styles.addButtonText}>+ Añadir a la batalla</Text>
                    </Pressable>
                </Animated.View>

                <Pressable style={styles.toggleButton} onPress={togglePanel}>
                    <Text style={styles.toggleText}>
                        {isPanelOpen
                            ? "▼ Añadir combatientes ▼"
                            : "▲ Añadir combatientes ▲"}
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
    scroll: {
        flex: 1,
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

    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        alignItems: "center",
    },
    battleName: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 4,
    },
    battleNotes: {
        color: "#9ca3af",
        fontSize: 12,
        textAlign: "center",
    },
    emptyText: {
        color: "#9ca3af",
        textAlign: "center",
        marginTop: 12,
    },

    combatRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0f172a",
        marginHorizontal: 8,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 6,
    },
    leftBlock: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        gap: 8,
    },
    initiativeBadge: {
        width: 32,
        height: 32,
        borderRadius: 999,
        backgroundColor: "#111827",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#4b5563",
    },
    initiativeText: {
        color: "#e5e7eb",
        fontWeight: "bold",
    },
    mainText: {
        flex: 1,
    },
    combatName: {
        color: "white",
        fontSize: 15,
        fontWeight: "500",
    },
    combatStats: {
        marginTop: 2,
        fontSize: 12,
    },
    acText: {
        color: "#e5e7eb",
    },
    grayText: {
        color: "#6b7280",
    },
    hpText: {
        color: "#22c55e", // verde
    },
    tempHpText: {
        color: "#14b8a6", // turquesa
    },

    rightBlock: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginLeft: 6,
    },
    hpButton: {
        width: 26,
        height: 26,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    hpButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 13,
    },
    damageButton: {
        backgroundColor: "#dc2626",
    },
    healButton: {
        backgroundColor: "#22c55e",
    },
    tempButton: {
        backgroundColor: "#0ea5e9",
    },
    amountInput: {
        width: 40,
        height: 26,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#4b5563",
        color: "white",
        paddingHorizontal: 4,
        paddingVertical: 2,
        fontSize: 13,
        textAlign: "center",
    },

    // FOOTER
    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        // bottom lo controlamos en línea con keyboardOffset
    },
    addPanel: {
        backgroundColor: "#020617",
        borderTopWidth: 1,
        borderTopColor: "#1f2937",
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 10,
    },
    savingText: {
        color: "#a5b4fc",
        textAlign: "center",
        fontSize: 12,
        marginBottom: 4,
    },
    toggleButton: {
        backgroundColor: "#020617",
        borderTopWidth: 1,
        borderTopColor: "#1f2937",
        paddingVertical: 6,
        alignItems: "center",
    },
    toggleText: {
        color: "#e5e7eb",
        fontSize: 13,
        fontWeight: "500",
    },

    fromRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
        marginBottom: 8,
    },
    fromChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#4b5563",
    },
    fromChipActive: {
        backgroundColor: "#4f46e5",
        borderColor: "#6366f1",
    },
    fromChipText: {
        color: "#9ca3af",
        fontSize: 12,
    },
    fromChipTextActive: {
        color: "white",
    },

    label: {
        color: "#9ca3af",
        fontSize: 12,
        marginBottom: 2,
    },
    chipsScroll: {
        marginBottom: 8,
    },
    nameChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#4b5563",
        marginRight: 6,
    },
    nameChipActive: {
        backgroundColor: "#1d4ed8",
        borderColor: "#1d4ed8",
    },
    nameChipText: {
        color: "#e5e7eb",
        fontSize: 12,
    },
    nameChipTextActive: {
        color: "white",
        fontWeight: "500",
    },

    inputsRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 8,
    },
    fieldSmall: {
        flex: 1,
    },
    input: {
        minHeight: 32,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#4b5563",
        color: "white",
        paddingHorizontal: 6,
        paddingVertical: 4,
        fontSize: 14,
    },
    addButton: {
        backgroundColor: "#4f46e5",
        paddingVertical: 9,
        borderRadius: 8,
        alignItems: "center",
    },
    addButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
    },
});
