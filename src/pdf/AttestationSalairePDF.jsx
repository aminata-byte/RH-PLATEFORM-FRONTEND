import { Document, Page, Text, View } from "@react-pdf/renderer";
import { entreprise } from "./entreprise";
import { baseStyles as s } from "./styles";

// Montants alignés sur ceux du bulletin de paie d'exemple (BulletinPaiePDF).
function AttestationSalairePDF({ employe, dateEdition, salaireBrut = "3 200,00", salaireNet = "2 812,30" }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.entete}>
          <Text style={s.entrepriseNom}>{entreprise.nom}</Text>
          <Text style={s.entrepriseLigne}>{entreprise.adresse}</Text>
          <Text style={s.entrepriseLigne}>{entreprise.ville}</Text>
          <Text style={s.entrepriseLigne}>
            SIRET {entreprise.siret} - NAF {entreprise.naf}
          </Text>
        </View>

        <Text style={s.dateLieu}>
          {entreprise.ville.split(" ").slice(1).join(" ")}, le {dateEdition}
        </Text>

        <Text style={s.titre}>Attestation de salaire</Text>

        <Text style={s.paragraphe}>
          Je soussigné(e), représentant légal de la société {entreprise.nom}, atteste que :
        </Text>

        <View style={s.encadre}>
          <View style={s.encadreLigne}>
            <Text style={s.encadreLabel}>Nom et prénom</Text>
            <Text style={s.encadreValeur}>{employe.nom}</Text>
          </View>
          <View style={s.encadreLigne}>
            <Text style={s.encadreLabel}>Poste occupé</Text>
            <Text style={s.encadreValeur}>{employe.poste}</Text>
          </View>
          <View style={s.encadreLigne}>
            <Text style={s.encadreLabel}>Type de contrat</Text>
            <Text style={s.encadreValeur}>{employe.typeContrat}</Text>
          </View>
          <View style={s.encadreLigne}>
            <Text style={s.encadreLabel}>Employé(e) depuis le</Text>
            <Text style={s.encadreValeur}>{employe.dateEmbauche}</Text>
          </View>
        </View>

        <Text style={s.paragraphe}>
          perçoit, dans le cadre de son contrat de travail, une rémunération mensuelle telle
          que détaillée ci-dessous :
        </Text>

        <View style={s.encadre}>
          <View style={s.encadreLigne}>
            <Text style={s.encadreLabel}>Salaire brut mensuel</Text>
            <Text style={s.encadreValeur}>{salaireBrut} €</Text>
          </View>
          <View style={s.encadreLigne}>
            <Text style={s.encadreLabel}>Salaire net mensuel</Text>
            <Text style={s.encadreValeur}>{salaireNet} €</Text>
          </View>
        </View>

        <Text style={s.paragraphe}>
          Cette attestation est délivrée à l'intéressé(e) à sa demande, pour servir et valoir
          ce que de droit.
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

export default AttestationSalairePDF;
