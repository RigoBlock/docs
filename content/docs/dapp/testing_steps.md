---
title: "Testing Steps"
category: "kb"
---

# Holder

## Home page

- Si carica la lista dei fondi. La lista e' ricavata dagli eventi, quindi c'e' la possibilita' che l'endpoint non ritorni tutti gli eventi e quindi la lista non sia attendibile al 100%. E' una circostanza che non possiamo controllare.

  - Possibili soluzioni:
    - uno nostra api che pubblica un hash aggiornato dell'array degli indirizzi dei fondi. In questo modo potreo per lo meno sapere se la lista e' corretta oppure no.
    - una nostra api che pubblica un array con i dettagli dei fondi. Potrebbe essere una soluzione offchain, ma non deve essere la fonte principale dei dati. Dobbiamo sempre cercare di implementare soluzioni quanto piu' decentralizzate possibile, quindi ogni dato che viene da fonti centralizzate, deve essere un backup da utilizzare solo in caso di problemi con il fetching dai nodi. In sintesi, la dapp deve essere in grado di girare in modalita' totalmente, o quasi totalmente decentralizzata se necessario.

- E' possibile filtrare la lista dei fondi per simbolo e nome utilizzando il tool di ricerca.
- E' possibile navigare alla pagina del fondo tramite il pulsante view.
- E' possibile navigare alla pagina dashboard dei draghi e vault tramite i pulsanti nei relativi box.

## Sezione Vault

- Si visualizzano correttamente la lista di vault e transazioni recenti.
- I dati dei balance ETH e GRG sono corretti.
- E' possibile trasferire ETH e GRG tramite il pulsante TRANSFER
- E' possibile navigare alla pagina del vault tramite il pulsante view.
- E' possibile navigare alla pagina di ricerca dei vault tramite il pulsante nel menu' di sinistra.
- Tutti i vari bottoni funzionano correttamente (link alle stransazioni su etherscan e simili).

## Sezione Drago

- Come per i Vault.

# Manager

## Sezione Vault

- Possibile creare un Vault tramite il pulsante DEPLOY.
- E' possibile settare la fee tramite il punsante MANAGE.
- Vengono mostrare le transazioni correttamente.

## Sezione Drago

- Possibile creare un Drago tramite il punsante DEPLOY.
- E' possibile settare la fee tramite il punsante MANAGE.
- Vengono mostrare le transazioni correttamente.
- E' possibile settare il prezzo e wrappare ETH tramite il pulsante MANAGE.
- I dati riportate relativi al portafoglio e valore del Drago sono corretti.

## Exchange

- Se l'account non ha alcun drago, viene mostrato un messaggio che invita a crearne uno.
- Testare tutte le funzionalita' dell'exchange.

## Funzionalita' in generale

- La dapp si sincronizza correttamente con l'account selezionato su MetaMask.
- Le modifiche sono visualizzate in real time.
