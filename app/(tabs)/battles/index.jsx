import { useRouter } from "expo-router";
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
    createBattle,
    deleteBattle,
    getAllBattles,
} from "../../../services/apiService";

export default function BattlesScreen() {
  const router = useRouter();

  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    notes: "",
  });

  useEffect(() => {
    loadBattles();
  }, []);

  const loadBattles = async () => {
    try {
      setLoading(true);
      const data = await getAllBattles();
      // Por si algún día quieres ordenarlas por id descendente
      const sorted = (data || []).slice().sort((a, b) => b.id - a.id);
      setBattles(sorted);
    } catch (error) {
      console.log("Error cargando batallas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateBattle = async () => {
    const name = form.name.trim();
    const notes = form.notes.trim() || null;

    if (!name) {
      Alert.alert("Nombre obligatorio", "Ponle un nombre a la batalla.");
      return;
    }

    try {
      setSaving(true);
      const body = {
        name,
        notes,
        // combatants se inicializa vacío (default [] en la tabla)
      };
      await createBattle(body);
      setForm({ name: "", notes: "" });
      await loadBattles();
    } catch (error) {
      console.log("Error creando batalla:", error);
      Alert.alert("Error", "No se pudo crear la batalla.");
    } finally {
      setSaving(false);
    }
  };

  // ---- borrar batalla ----
  const reallyDeleteBattle = async (id) => {
    try {
      setSaving(true);
      await deleteBattle(id);
      setBattles((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.log("Error eliminando batalla:", error);
      Alert.alert("Error", "No se pudo eliminar la batalla.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBattle = (id, name) => {
    const msg = `¿Seguro que quieres eliminar la batalla "${name}"?`;

    if (Platform.OS === "web") {
      const ok = window.confirm(msg);
      if (!ok) return;
      reallyDeleteBattle(id);
    } else {
      Alert.alert("Eliminar batalla", msg, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => reallyDeleteBattle(id),
        },
      ]);
    }
  };

  const goToBattle = (id) => {
    router.push(`/battles/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.loadingText}>Cargando batallas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Batallas</Text>

      <ScrollView
        style={styles.listArea}
        contentContainerStyle={{ paddingBottom: 12 }}
      >
        {battles.length === 0 ? (
          <Text style={styles.emptyText}>
            Aún no tienes batallas creadas. Crea una abajo.
          </Text>
        ) : (
          battles.map((b) => (
            <Pressable
              key={b.id}
              style={styles.row}
              onPress={() => goToBattle(b.id)}
            >
              <View style={styles.rowText}>
                <Text style={styles.name}>{b.name}</Text>
                {b.notes ? (
                  <Text style={styles.notes}>📝 {b.notes}</Text>
                ) : null}
                <Text style={styles.smallInfo}>
                  {Array.isArray(b.combatants)
                    ? `${b.combatants.length} combatientes`
                    : "0 combatientes"}
                </Text>
              </View>

              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDeleteBattle(b.id, b.name)}
              >
                <Text style={styles.deleteText}>Eliminar</Text>
              </Pressable>
            </Pressable>
          ))
        )}
      </ScrollView>

      {saving && (
        <Text style={styles.savingText}>
          Guardando cambios en batallas...
        </Text>
      )}

      {/* FORMULARIO CREAR BATALLA */}
      <View style={styles.addBox}>
        <Text style={styles.addTitle}>Crear nueva batalla</Text>

        <Text style={styles.label}>Nombre de la batalla</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(text) => handleChange("name", text)}
          placeholder="Guarida de los bandidos, Dragón rojo, etc."
          placeholderTextColor="#6b7280"
        />

        <Text style={styles.label}>Notas (opcional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={form.notes}
          onChangeText={(text) => handleChange("notes", text)}
          placeholder="Resumen, misión, lugar, etc."
          placeholderTextColor="#6b7280"
          multiline
        />

        <Pressable
          style={styles.addButton}
          onPress={handleCreateBattle}
          disabled={saving}
        >
          <Text style={styles.addButtonText}>+ Crear batalla</Text>
        </Pressable>
      </View>
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
  notes: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },
  smallInfo: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 4,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#f87171",
    marginLeft: 8,
    marginTop: 2,
  },
  deleteText: {
    color: "#f87171",
    fontSize: 12,
    fontWeight: "500",
  },

  addBox: {
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    paddingTop: 10,
    paddingBottom: 12,
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
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  addButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
