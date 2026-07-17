import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { entreprise } from "./entreprise";

// Montants illustratifs — ce composant génère un exemple de bulletin de paie.
// Le calcul de paie réel (cotisations, taux) viendra du backend / d'un moteur de paie.
const GAINS = [
  { designation: "Salaire de base", base: "151,67", taux: "—", montant: "3 200,00" },
];

const RETENUES = [
  { section: true, label: "Santé" },
  { designation: "Sécurité sociale plafonnée", base: "3 428,00", tauxSal: "6,900", montantSal: "236,53", tauxPat: "8,900", montantPat: "305,09" },
  { designation: "Sécurité sociale déplafonnée", base: "3 428,00", tauxSal: "0,400", montantSal: "13,71", tauxPat: "1,900", montantPat: "65,13" },
  { designation: "Complémentaire T1", base: "3 428,00", tauxSal: "4,010", montantSal: "137,46", tauxPat: "6,010", montantPat: "206,02" },
  { section: true, label: "Famille" },
  { designation: "Allocations familiales", base: "3 428,00", tauxSal: "—", montantSal: "—", tauxPat: "3,450", montantPat: "118,26" },
  { section: true, label: "Assurance chômage" },
  { designation: "Assurance chômage", base: "3 428,00", tauxSal: "—", montantSal: "—", tauxPat: "4,050", montantPat: "138,83" },
  { designation: "AGS", base: "3 428,00", tauxSal: "—", montantSal: "—", tauxPat: "0,150", montantPat: "5,14" },
  { section: true, label: "Autres contributions dues par l'employeur" },
  { designation: "Cotisation FNAL", base: "3 428,00", tauxSal: "—", montantSal: "—", tauxPat: "0,100", montantPat: "3,43" },
  { designation: "Contribution de solidarité autonomie", base: "3 428,00", tauxSal: "—", montantSal: "—", tauxPat: "0,300", montantPat: "10,28" },
  { designation: "Cotisation de formation professionnelle", base: "3 428,00", tauxSal: "—", montantSal: "—", tauxPat: "0,550", montantPat: "18,85" },
  { designation: "Taxe d'apprentissage", base: "3 428,00", tauxSal: "—", montantSal: "—", tauxPat: "0,680", montantPat: "23,31" },
];

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 8, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  title: { fontSize: 15, fontFamily: "Helvetica-Bold" },
  periode: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  identBlock: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, gap: 12 },
  box: { width: "48%" },
  boxTitle: { fontFamily: "Helvetica-Bold", marginBottom: 2, fontSize: 8.5 },
  line: { marginBottom: 1.5, fontSize: 7.5 },
  bandeau: { flexDirection: "row", justifyContent: "space-between", borderTop: "1pt solid #333", borderBottom: "1pt solid #333", paddingVertical: 4, marginBottom: 10, fontSize: 7.5 },
  sectionRow: { flexDirection: "row", marginBottom: 8 },
  sectionLabel: { width: 12, fontFamily: "Helvetica-Bold", fontSize: 6.5, transform: "rotate(-90deg)", textAlign: "center" },
  table: { flex: 1, border: "0.5pt solid #555" },
  theadRow: { flexDirection: "row", backgroundColor: "#EBF0EF", borderBottom: "0.5pt solid #555" },
  trow: { flexDirection: "row", borderBottom: "0.5pt solid #ddd" },
  sectionSubRow: { flexDirection: "row", backgroundColor: "#F7F8F7", borderBottom: "0.5pt solid #ddd" },
  th: { padding: 3, fontFamily: "Helvetica-Bold", fontSize: 6.8 },
  td: { padding: 3, fontSize: 6.8 },
  colDesignation: { width: "40%" },
  colNum: { width: "12%", textAlign: "right" },
  totalRow: { flexDirection: "row", backgroundColor: "#F0EBDE", borderTop: "0.5pt solid #555" },
  netBlock: { marginTop: 10, borderTop: "1.2pt solid #333", paddingTop: 6 },
  netRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  netLabel: { fontSize: 9 },
  netValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  netFinalRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#EBF0EF", padding: 6, marginTop: 2 },
  netFinalLabel: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  netFinalValue: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  cumulsTitle: { fontFamily: "Helvetica-Bold", fontSize: 8, marginTop: 14, marginBottom: 4 },
  cumulsTable: { border: "0.5pt solid #555" },
  footer: { marginTop: 16, fontSize: 6.5, textAlign: "center", color: "#666" },
});

function BulletinPaiePDF({ employe, periode, salaireBase = "3 200,00" }) {
  const totalGains = "3 200,00";
  const totalRetenuesSal = "387,70";
  const totalRetenuesPat = "889,34";
  const netAvantImpot = "2 812,30";
  const impot = "421,85";
  const netAPayer = "2 390,45";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>BULLETIN DE PAIE</Text>
          <Text style={styles.periode}>{periode.code}</Text>
        </View>

        <View style={styles.identBlock}>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>{entreprise.nom}</Text>
            <Text style={styles.line}>{entreprise.adresse}</Text>
            <Text style={styles.line}>{entreprise.ville}</Text>
            <Text style={styles.line}>
              SIRET {entreprise.siret} - NAF {entreprise.naf}
            </Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>{employe.nom}</Text>
            <Text style={styles.line}>Matricule : {employe.matricule}</Text>
            <Text style={styles.line}>Emploi : {employe.poste}</Text>
            <Text style={styles.line}>Département : {employe.departement}</Text>
            <Text style={styles.line}>Contrat : {employe.typeContrat}</Text>
            <Text style={styles.line}>Début contrat : {employe.dateEmbauche}</Text>
          </View>
        </View>

        <View style={styles.bandeau}>
          <Text>Établissement : {entreprise.nom}</Text>
          <Text>
            Période du {periode.debut} au {periode.fin}
          </Text>
          <Text>Payé le {periode.datePaiement} par virement</Text>
        </View>

        {/* GAINS */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>GAINS</Text>
          <View style={styles.table}>
            <View style={styles.theadRow}>
              <Text style={[styles.th, styles.colDesignation]}>Désignation</Text>
              <Text style={[styles.th, styles.colNum]}>Base</Text>
              <Text style={[styles.th, styles.colNum]}>Taux</Text>
              <Text style={[styles.th, styles.colNum]}>Montant</Text>
            </View>
            {GAINS.map((g) => (
              <View style={styles.trow} key={g.designation}>
                <Text style={[styles.td, styles.colDesignation]}>{g.designation}</Text>
                <Text style={[styles.td, styles.colNum]}>{g.base}</Text>
                <Text style={[styles.td, styles.colNum]}>{g.taux}</Text>
                <Text style={[styles.td, styles.colNum]}>{g.montant}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={[styles.th, styles.colDesignation]}>TOTAL GAINS</Text>
              <Text style={[styles.th, styles.colNum]}></Text>
              <Text style={[styles.th, styles.colNum]}></Text>
              <Text style={[styles.th, styles.colNum]}>{totalGains}</Text>
            </View>
          </View>
        </View>

        {/* RETENUES */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>RETENUES</Text>
          <View style={styles.table}>
            <View style={styles.theadRow}>
              <Text style={[styles.th, styles.colDesignation]}>Désignation</Text>
              <Text style={[styles.th, styles.colNum]}>Base</Text>
              <Text style={[styles.th, styles.colNum]}>Taux sal.</Text>
              <Text style={[styles.th, styles.colNum]}>Mont. sal.</Text>
              <Text style={[styles.th, styles.colNum]}>Taux pat.</Text>
              <Text style={[styles.th, styles.colNum]}>Mont. pat.</Text>
            </View>
            {RETENUES.map((r, i) =>
              r.section ? (
                <View style={styles.sectionSubRow} key={`s-${i}`}>
                  <Text style={[styles.td, { fontFamily: "Helvetica-Bold" }]}>{r.label}</Text>
                </View>
              ) : (
                <View style={styles.trow} key={r.designation}>
                  <Text style={[styles.td, styles.colDesignation]}>{r.designation}</Text>
                  <Text style={[styles.td, styles.colNum]}>{r.base}</Text>
                  <Text style={[styles.td, styles.colNum]}>{r.tauxSal}</Text>
                  <Text style={[styles.td, styles.colNum]}>{r.montantSal}</Text>
                  <Text style={[styles.td, styles.colNum]}>{r.tauxPat}</Text>
                  <Text style={[styles.td, styles.colNum]}>{r.montantPat}</Text>
                </View>
              ),
            )}
            <View style={styles.totalRow}>
              <Text style={[styles.th, styles.colDesignation]}>TOTAL RETENUES</Text>
              <Text style={[styles.th, styles.colNum]}></Text>
              <Text style={[styles.th, styles.colNum]}></Text>
              <Text style={[styles.th, styles.colNum]}>{totalRetenuesSal}</Text>
              <Text style={[styles.th, styles.colNum]}></Text>
              <Text style={[styles.th, styles.colNum]}>{totalRetenuesPat}</Text>
            </View>
          </View>
        </View>

        <View style={styles.netBlock}>
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>NET À PAYER AVANT IMPÔT SUR LE REVENU</Text>
            <Text style={styles.netValue}>{netAvantImpot} €</Text>
          </View>
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Impôt sur le revenu (taux non personnalisé)</Text>
            <Text style={styles.netValue}>{impot} €</Text>
          </View>
          <View style={styles.netFinalRow}>
            <Text style={styles.netFinalLabel}>NET À PAYER</Text>
            <Text style={styles.netFinalValue}>{netAPayer} €</Text>
          </View>
        </View>

        <Text style={styles.cumulsTitle}>Cumuls annuels</Text>
        <View style={styles.cumulsTable}>
          <View style={styles.theadRow}>
            <Text style={[styles.th, styles.colDesignation]}>Cumuls</Text>
            <Text style={[styles.th, styles.colNum]}>Période</Text>
            <Text style={[styles.th, styles.colNum]}>Cumulé</Text>
          </View>
          <View style={styles.trow}>
            <Text style={[styles.td, styles.colDesignation]}>Net imposable</Text>
            <Text style={[styles.td, styles.colNum]}>{netAvantImpot}</Text>
            <Text style={[styles.td, styles.colNum]}>{netAvantImpot}</Text>
          </View>
          <View style={styles.trow}>
            <Text style={[styles.td, styles.colDesignation]}>Soumis à cotisations</Text>
            <Text style={[styles.td, styles.colNum]}>{salaireBase}</Text>
            <Text style={[styles.td, styles.colNum]}>{salaireBase}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Dans votre intérêt, conservez ce bulletin sans limitation de durée.{"\n"}
          Document généré automatiquement — modèle d'exemple à adapter aux données réelles de paie.
        </Text>
      </Page>
    </Document>
  );
}

export default BulletinPaiePDF;
