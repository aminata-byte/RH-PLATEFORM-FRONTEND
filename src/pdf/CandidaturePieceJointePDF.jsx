import { Document, Page, Text, View } from "@react-pdf/renderer";
import { entreprise } from "./entreprise";
import { baseStyles as s } from "./styles";

// Aperçu de substitution pour le CV / la lettre de motivation d'une candidature
// de démonstration (sans vrai fichier uploadé).
function CandidaturePieceJointePDF({ titre, candidatNom, offreTitre, dateEdition }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.entete}>
          <Text style={s.entrepriseNom}>{entreprise.nom}</Text>
          <Text style={s.entrepriseLigne}>{entreprise.adresse}</Text>
          <Text style={s.entrepriseLigne}>{entreprise.ville}</Text>
        </View>

        <Text style={s.dateLieu}>
          {entreprise.ville.split(" ").slice(1).join(" ")}, le {dateEdition}
        </Text>

        <Text style={s.titre}>{titre}</Text>

        <View style={s.encadre}>
          <View style={s.encadreLigne}>
            <Text style={s.encadreLabel}>Candidat</Text>
            <Text style={s.encadreValeur}>{candidatNom}</Text>
          </View>
          <View style={s.encadreLigne}>
            <Text style={s.encadreLabel}>Offre</Text>
            <Text style={s.encadreValeur}>{offreTitre}</Text>
          </View>
        </View>

        <Text style={s.paragraphe}>
          Cette candidature provient d'un jeu de données de démonstration : aucun fichier n'a
          réellement été téléversé. Cet aperçu tient lieu de substitut — une vraie candidature
          affichera ici le CV ou la lettre de motivation effectivement envoyés par le candidat.
        </Text>

        <Text style={s.footer} fixed>
          {entreprise.nom} — Document généré automatiquement par la plateforme RH
        </Text>
      </Page>
    </Document>
  );
}

export default CandidaturePieceJointePDF;
