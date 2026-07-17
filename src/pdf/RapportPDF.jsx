import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { entreprise } from "./entreprise";

// Modèle générique de rapport PDF, réutilisable pour n'importe quel module
// (employés, congés, absences, recrutement, performances...) en lui passant
// des kpis et des sections différentes. C'est l'exemple à dupliquer/adapter
// pour les futurs exports une fois les données réelles branchées.

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, borderBottom: "1.2pt solid #1E3A5F", paddingBottom: 10 },
  entrepriseNom: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1E3A5F" },
  entrepriseAdresse: { fontSize: 7.5, color: "#555", marginTop: 1 },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#1E3A5F" },
  genereLe: { fontSize: 7.5, color: "#666", marginTop: 2, textAlign: "right" },
  kpiRow: { flexDirection: "row", gap: 10, marginTop: 16, marginBottom: 18 },
  kpiBox: { flex: 1, border: "0.5pt solid #DCE3E1", borderRadius: 4, padding: 8 },
  kpiValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#1E3A5F" },
  kpiLabel: { fontSize: 7, color: "#555", marginTop: 2 },
  sectionTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: "#1a1a1a", marginBottom: 5, marginTop: 14 },
  table: { border: "0.5pt solid #999" },
  theadRow: { flexDirection: "row", backgroundColor: "#EBF0EF", borderBottom: "0.5pt solid #999" },
  trow: { flexDirection: "row", borderBottom: "0.5pt solid #E2E8F0" },
  th: { padding: 4, fontFamily: "Helvetica-Bold", fontSize: 7.5 },
  td: { padding: 4, fontSize: 7.5 },
  footer: { position: "absolute", bottom: 24, left: 32, right: 32, fontSize: 6.5, color: "#888", textAlign: "center", borderTop: "0.5pt solid #E2E8F0", paddingTop: 6 },
});

function RapportPDF({ titre, kpis = [], sections = [] }) {
  const genereLe = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.entrepriseNom}>{entreprise.nom}</Text>
            <Text style={styles.entrepriseAdresse}>
              {entreprise.adresse} — {entreprise.ville}
            </Text>
          </View>
          <View>
            <Text style={styles.title}>{titre}</Text>
            <Text style={styles.genereLe}>Généré le {genereLe}</Text>
          </View>
        </View>

        {kpis.length > 0 && (
          <View style={styles.kpiRow}>
            {kpis.map((k) => (
              <View style={styles.kpiBox} key={k.label}>
                <Text style={styles.kpiValue}>{k.valeur}</Text>
                <Text style={styles.kpiLabel}>{k.label}</Text>
              </View>
            ))}
          </View>
        )}

        {sections.map((section) => (
          <View key={section.titre} wrap={false}>
            <Text style={styles.sectionTitle}>{section.titre}</Text>
            <View style={styles.table}>
              <View style={styles.theadRow}>
                {section.colonnes.map((col) => (
                  <Text style={[styles.th, { flex: 1 }]} key={col}>
                    {col}
                  </Text>
                ))}
              </View>
              {section.lignes.map((ligne, i) => (
                <View style={styles.trow} key={i}>
                  {ligne.map((valeur, j) => (
                    <Text style={[styles.td, { flex: 1 }]} key={j}>
                      {valeur}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.footer} fixed>
          {entreprise.nom} — Document généré automatiquement par la plateforme RH
        </Text>
      </Page>
    </Document>
  );
}

export default RapportPDF;
