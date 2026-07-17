import { Document, Page, Text, View } from "@react-pdf/renderer";
import { entreprise } from "./entreprise";
import { baseStyles as s } from "./styles";

function ContratTravailPDF({ employe, dateEdition, salaireBase = "3 200,00" }) {
  const estCDI = employe.typeContrat === "CDI";
  const clauseDuree = estCDI
    ? "Le présent contrat est conclu pour une durée indéterminée, à compter du " +
      employe.dateEmbauche + "."
    : `Le présent contrat est conclu pour une durée déterminée, du ${employe.dateEmbauche} au ${employe.dateFinContrat ?? "—"}, en qualité de ${employe.typeContrat.toLowerCase()}.`;

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

        <Text style={s.titre}>Contrat de travail — {employe.typeContrat}</Text>

        <Text style={s.paragraphe}>
          Entre la société {entreprise.nom}, dont le siège social est situé au{" "}
          {entreprise.adresse}, {entreprise.ville}, ci-après dénommée « l'employeur »,
        </Text>
        <Text style={s.paragraphe}>
          Et {employe.nom}, ci-après dénommé(e) « le/la salarié(e) »,
        </Text>
        <Text style={s.paragraphe}>Il a été convenu ce qui suit :</Text>

        <Text style={s.articleTitre}>Article 1 — Engagement</Text>
        <Text style={s.paragraphe}>
          L'employeur engage le/la salarié(e), qui accepte, en qualité de {employe.poste} au
          sein du département {employe.departement}.
        </Text>

        <Text style={s.articleTitre}>Article 2 — Durée du contrat</Text>
        <Text style={s.paragraphe}>{clauseDuree}</Text>

        <Text style={s.articleTitre}>Article 3 — Période d'essai</Text>
        <Text style={s.paragraphe}>
          Le présent contrat ne deviendra définitif qu'à l'issue d'une période d'essai de deux
          mois, renouvelable une fois, durant laquelle chacune des parties pourra y mettre fin
          librement.
        </Text>

        <Text style={s.articleTitre}>Article 4 — Rémunération</Text>
        <View style={s.encadre}>
          <View style={s.encadreLigne}>
            <Text style={s.encadreLabel}>Salaire brut mensuel</Text>
            <Text style={s.encadreValeur}>{salaireBase} €</Text>
          </View>
          <View style={s.encadreLigne}>
            <Text style={s.encadreLabel}>Versé</Text>
            <Text style={s.encadreValeur}>Le dernier jour ouvré du mois</Text>
          </View>
        </View>

        <Text style={s.articleTitre}>Article 5 — Horaires et lieu de travail</Text>
        <Text style={s.paragraphe}>
          Le/la salarié(e) exercera ses fonctions au sein des locaux de {entreprise.nom},{" "}
          {entreprise.ville}, selon l'horaire collectif en vigueur dans l'entreprise, soit 35
          heures hebdomadaires.
        </Text>

        <Text style={s.articleTitre}>Article 6 — Convention collective</Text>
        <Text style={s.paragraphe}>
          Le présent contrat est régi par les dispositions de {entreprise.conventionCollective}.
        </Text>

        <View style={s.signatureBlock}>
          <Text style={s.signatureLigne}>Fait en deux exemplaires, à {entreprise.ville}</Text>
          <Text style={s.signatureLigne}>L'employeur — Le/la salarié(e)</Text>
        </View>

        <Text style={s.footer} fixed>
          {entreprise.nom} — Document généré automatiquement par la plateforme RH
        </Text>
      </Page>
    </Document>
  );
}

export default ContratTravailPDF;
