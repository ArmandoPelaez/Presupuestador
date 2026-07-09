## ADDED Requirements

### Requirement: AI draft can prefill quote form
The quote management flow SHALL accept an AI-generated draft as initial form data while preserving the existing manual review, validation, calculation and save behavior.

#### Scenario: Form opens with AI draft
- **WHEN** the owner accepts a generated AI draft
- **THEN** the application SHALL open or update the normal quote form with the suggested customer, items, notes and validity data prefilled

#### Scenario: Owner can edit generated values
- **WHEN** the quote form is prefilled from an AI draft
- **THEN** the owner SHALL be able to edit customer selection, item descriptions, catalog matches, quantities, units, prices, notes and dates before saving

#### Scenario: Existing backend calculation remains authoritative
- **WHEN** the owner saves a quote that originated from an AI draft
- **THEN** the backend MUST validate the submitted payload, calculate totals and persist the quote using the existing quote creation rules

#### Scenario: Generated draft can be discarded
- **WHEN** the owner cancels or leaves the AI draft flow before saving
- **THEN** the system MUST discard the draft without creating a quote or changing existing records

### Requirement: AI origin is visible during review
The quote form SHALL clearly indicate when its current values were generated from AI so the owner knows the draft requires review before saving.

#### Scenario: AI review notice is shown
- **WHEN** the quote form is populated from an AI-generated draft
- **THEN** the application SHALL show a review notice indicating that the data was generated with AI and must be checked before saving

#### Scenario: Manual quote flow is unchanged
- **WHEN** the owner creates a quote without using **Crear con IA**
- **THEN** the application SHALL keep the existing manual quote creation behavior without showing AI-specific review state
