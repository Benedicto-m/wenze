//! Smart Contract Escrow pour WENZE
//! 
//! Ce contrat implémente la logique d'escrow complète selon le workflow :
//! - Vérifie la signature du buyer pour Release
//! - Vérifie le deadline pour Refund
//! - Utilise un datum structuré avec toutes les informations nécessaires

use cardano/transaction.{Transaction, OutputReference}
use aiken/crypto.{VerificationKeyHash}
use aiken/collection/list
use aiken/interval

pub type EscrowDatum {
  order_id: ByteArray,
  buyer: VerificationKeyHash,
  seller: VerificationKeyHash,
  amount: Int,
  deadline: Int, // Timestamp Unix en millisecondes
}

pub type EscrowRedeemer {
  Release // Libère les fonds au vendeur (signé par l'acheteur)
  Refund  // Rembourse l'acheteur (si délai expiré)
}

// Validator pour l'escrow
// Syntaxe Aiken v1.1.21 : utiliser "validator" avec "spend" directement
validator escrow {
  spend(datum: Option<EscrowDatum>, redeemer: EscrowRedeemer, _utxo: OutputReference, ctx: Transaction) {
    when datum is {
      Some(escrow_datum) -> {
        when redeemer is {
          Release -> {
            // Vérifier que le signataire est l'acheteur
            // Le buyer doit être dans la liste des signataires supplémentaires
            list.has(ctx.extra_signatories, escrow_datum.buyer)
          }
          Refund -> {
            // Vérifier que le délai est expiré
            // Le validity_range doit commencer entièrement après le deadline
            ctx.validity_range |> interval.is_entirely_after(escrow_datum.deadline)
          }
        }
      }
      None -> False
    }
  }
}
