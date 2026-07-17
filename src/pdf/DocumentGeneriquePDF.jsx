import { Document, Page, Text, View } from "@react-pdf/renderer";
import { entreprise } from "./entreprise";
import { baseStyles as s } from "./styles";

// Gabarit de secours pour le type "Autre", dont le contenu n'est pas standardisé.
function DocumentGeneriquePDF({ titre, employe, dateEdition }) {
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
            <Text style={s.encadreLabel}>Concerne</Text>
            <Text style={s.encadreValeur}>{employe.nom}</Text>
          </View>
          <View style={s.encadreLigne}>
            <Text style={s.encadreLabel}>Poste</Text>
            <Text style={s.encadreValeur}>{employe.poste}</Text>
          </View>
        </View>

        <Text style={s.paragraphe}>
          Ce document est un modèle d'exemple généré par la plateforme RH pour le type
          « Autre ». Son contenu dépendra de la nature exacte du document une fois les besoins
          précisés avec l'entreprise.
        </Text>

        <View style={s.signatureBlock}>
          <Text style={s.signatureLigne}>Pour {entreprise.nom}</Text>
          <Text style={s.signatureLigne}>Le service Ressources Humaines</Text>
        </View>

        <Text style={s.footer} fixed>
          {entreprise.nom} — Document généré automatiquement par la plateforme RH
        </Text>
      </Page>
    </Document>
  );
}

export default DocumentGeneriquePDF;
