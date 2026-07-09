## ADDED Requirements

### Requirement: Dictated quote drafts require owner verification before persistence
The quote management flow MUST require owner verification and the normal save action before persisting any quote that originated from voice dictation.

#### Scenario: Dictation creates only draft input
- **WHEN** the owner dictates a quote description
- **THEN** the system MUST NOT create a quote, reserve a quote number, change quote status or persist quote items

#### Scenario: AI draft from dictation preloads normal form
- **WHEN** the owner generates an AI draft from a dictated description
- **THEN** the application SHALL preload the normal quote form for review without saving the quote automatically

#### Scenario: Owner saves after review
- **WHEN** the owner reviews a quote form that originated from dictated input and explicitly saves it
- **THEN** the backend MUST validate, calculate and persist the quote using the existing quote creation rules

#### Scenario: Owner leaves before saving
- **WHEN** the owner closes, cancels or navigates away before saving a quote that originated from dictated input
- **THEN** the system MUST leave persisted quotes, quote numbers, quote statuses and quote items unchanged
