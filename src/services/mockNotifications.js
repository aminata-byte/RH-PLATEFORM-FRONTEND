export const mockNotifications = [
  // Admin RH — Fatou Ndiaye
  {
    id: 1,
    destinataireEmail: "admin@rh.com",
    titre: "Nouvelle candidature reçue",
    message: "Ibrahima Ba a postulé pour Développeur Fullstack React/Laravel.",
    date: "2026-07-08T09:30:00",
    type: "info",
    lu: false,
  },
  {
    id: 2,
    destinataireEmail: "admin@rh.com",
    titre: "Souhait d'évolution soumis",
    message: "Awa Sarr souhaite évoluer vers Lead Développeuse Frontend.",
    date: "2026-07-07T14:10:00",
    type: "info",
    lu: false,
  },
  {
    id: 3,
    destinataireEmail: "admin@rh.com",
    titre: "Congé en attente",
    message: "Cheikh Kanté a demandé un congé du 01 au 10 août 2026.",
    date: "2026-07-05T11:00:00",
    type: "warning",
    lu: true,
  },

  // Manager — Moussa Diop
  {
    id: 4,
    destinataireEmail: "manager@rh.com",
    titre: "2 congés en attente de validation",
    message: "Awa Sarr et Cheikh Kanté attendent votre validation.",
    date: "2026-07-08T08:15:00",
    type: "warning",
    lu: false,
  },
  {
    id: 5,
    destinataireEmail: "manager@rh.com",
    titre: "Inscription formation en attente",
    message: "Awa Sarr s'est inscrite à \"Prise de parole en public\".",
    date: "2026-07-05T16:45:00",
    type: "info",
    lu: false,
  },

  // Salarié — Awa Sarr
  {
    id: 6,
    destinataireEmail: "salarie@rh.com",
    titre: "Congé validé",
    message: "Votre demande de congé maladie du 10 au 12 mai a été validée.",
    date: "2026-05-12T10:00:00",
    type: "success",
    lu: true,
  },
  {
    id: 7,
    destinataireEmail: "salarie@rh.com",
    titre: "Nouveau document disponible",
    message: "Votre bulletin de paie de juin 2026 est disponible.",
    date: "2026-07-01T09:00:00",
    type: "info",
    lu: false,
  },
  {
    id: 8,
    destinataireEmail: "salarie@rh.com",
    titre: "Objectif assigné",
    message: "Un nouvel objectif vous a été assigné par votre manager.",
    date: "2026-07-06T13:20:00",
    type: "info",
    lu: false,
  },

  // Candidat — Ibrahima Ba
  {
    id: 9,
    destinataireEmail: "candidat@rh.com",
    titre: "Candidature en entretien",
    message:
      "Votre candidature pour Développeur Fullstack React/Laravel passe en entretien.",
    date: "2026-06-25T15:30:00",
    type: "success",
    lu: false,
  },
  {
    id: 10,
    destinataireEmail: "candidat@rh.com",
    titre: "Candidature acceptée",
    message: "Félicitations ! Votre candidature pour Chargé de recrutement a été acceptée.",
    date: "2026-06-19T10:00:00",
    type: "success",
    lu: true,
  },
];
