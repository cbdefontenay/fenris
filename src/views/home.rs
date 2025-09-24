use dioxus::prelude::*;
use reqwest::Client; // Nous aurons besoin du client reqwest
use std::rc::Rc;
use Key::Enter;
use FetchState::{Error, Initial, Loading, Success};

// Définition de l'état de la requête
#[derive(Clone, PartialEq)]
enum FetchState {
    Initial,
    Loading,
    Error(String),
    Success(String),
}

#[component]
pub fn Home() -> Element {
    let mut url_input = use_signal(|| "".to_string());
    let mut fetch_url = use_signal(|| None::<String>);
    let mut fetch_state = use_signal(|| Initial);

    let _ = use_resource(move || async move {
        // Lire le signal, l'URL est copiée
        let url_to_fetch = fetch_url();

        let Some(url) = url_to_fetch else {
            return;
        };

        // Mettre à jour l'état de la requête à "Loading"
        *fetch_state.write() = Loading;

        let client = Client::new();

        match client.get(&url).send().await {
            Ok(response) => {
                match response.text().await {
                    Ok(body) => {
                        // Succès : stocker le corps dans l'état
                        *fetch_state.write() = Success(body);
                    }
                    Err(e) => {
                        // Erreur de lecture du corps
                        *fetch_state.write() = Error(format!("Erreur de lecture du corps: {e}"));
                    }
                }
            }
            Err(e) => {
                // Erreur de la requête (connexion, DNS, etc.)
                *fetch_state.write() = Error(format!("Erreur de requête HTTP: {e}"));
            }
        }
    });

    // Déterminer le contenu du TextArea et le style d'affichage
    let (textarea_content, textarea_style) = match fetch_state() {
        Initial => ("Collez une URL JSON et cliquez sur 'Charger'.".to_string(), "bg-gray-100 text-gray-500"),
        Loading => ("Chargement en cours...".to_string(), "bg-yellow-100 text-yellow-700"),
        Error(e) => (format!("Erreur:\n{e}"), "bg-red-100 text-red-700"),
        Success(body) => (body, "bg-green-50 text-gray-800"),
    };


    rsx! {
        div {
            class: "max-w-4xl mx-auto p-4 space-y-4",

            // Titre
            h1 {
                class: "text-3xl font-bold text-gray-800",
                "Rust JSON Tool (Dioxus)"
            }

            // Section d'entrée de l'URL
            div {
                class: "flex space-x-2",

                // Champ d'entrée de l'URL
                input {
                    class: "flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                    r#type: "url", // Utiliser l'attribut r#type pour les mots-clés
                    placeholder: "Collez l'URL de votre JSON ici...",
                    value: url_input(),
                    oninput: move |e| *url_input.write() = e.value(),
                    // Déclenche l'action sur la touche Entrée
                    onkeydown: move |e| {
                        if e.key() == Enter {
                            *fetch_url.write() = Some(url_input());
                        }
                    },
                }

                // Bouton de chargement
                button {
                    class: "px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150",
                    onclick: move |_| {
                        // Déclenche la requête en mettant à jour le signal `fetch_url`
                        *fetch_url.write() = Some(url_input());
                    },
                    "Charger JSON"
                }
            }

            // Section de sortie (TextArea)
            div {
                class: "w-full",

                // État de la requête (affiché au-dessus du TextArea)
                p {
                    class: "text-sm text-gray-600 mb-1",
                    "Statut: ",
                    span {
                        class: match fetch_state() {
                            FetchState::Error(_) => "text-red-600 font-bold",
                            FetchState::Loading => "text-yellow-600 font-bold",
                            _ => "text-gray-600",
                        },
                        match fetch_state() {
                            Initial => "Prêt",
                            Loading => "Chargement...",
                            Error(_) => "Erreur",
                            Success(_) => "Succès",
                        }
                    }
                }

                // TextArea
                textarea {
                    class: "w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none {textarea_style}",
                    // La clé `readonly` permet d'afficher mais d'empêcher l'édition
                    readonly: true,
                    // Le contenu provient de l'état de la requête
                    value: "{textarea_content}",
                }
            }
        }
    }
}