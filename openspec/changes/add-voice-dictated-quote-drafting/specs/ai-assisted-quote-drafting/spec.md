## ADDED Requirements

### Requirement: AI draft generation accepts reviewed dictated descriptions
The AI quote draft flow SHALL accept a description that originated from browser voice dictation after the owner has had an opportunity to review it.

#### Scenario: Generate draft from dictated description
- **WHEN** an authenticated owner reviews dictated text in the **Crear con IA** description field and requests draft generation
- **THEN** the system SHALL use the existing AI quote draft endpoint and structured draft contract to generate the draft

#### Scenario: Dictation does not bypass description validation
- **WHEN** a dictated description is shorter than the minimum length or longer than the configured maximum length
- **THEN** the system MUST apply the same validation behavior used for written descriptions

#### Scenario: Dictation does not change provider contract
- **WHEN** the backend receives an AI draft request that originated from dictated text
- **THEN** the backend MUST treat it as a normal `description` string and MUST NOT require audio metadata or a separate audio payload

### Requirement: AI draft review remains visible after dictated input
The system SHALL keep the AI review experience unchanged when the source description was dictated.

#### Scenario: Draft generated from dictated text
- **WHEN** the AI draft is generated from a dictated description
- **THEN** the application SHALL show the existing AI review notice before the owner can save the quote

#### Scenario: Draft can be discarded
- **WHEN** the owner discards a draft that came from dictated input
- **THEN** the system MUST discard the draft without creating or modifying a persisted quote
