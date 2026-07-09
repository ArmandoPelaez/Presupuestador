## ADDED Requirements

### Requirement: Authenticated AI quote draft generation
The system SHALL allow an authenticated owner to generate a quote draft from a free-text description without creating or modifying a persisted quote.

#### Scenario: Generate draft from description
- **WHEN** an authenticated owner submits a valid description through **Crear con IA**
- **THEN** the system SHALL return a structured draft containing suggested customer data, quote items, notes, validity information and warnings when applicable

#### Scenario: Visitor cannot generate draft
- **WHEN** an unauthenticated request attempts to generate an AI quote draft
- **THEN** the system MUST reject the request using the existing authentication error behavior

#### Scenario: Draft is not persisted automatically
- **WHEN** the system returns an AI-generated quote draft
- **THEN** the system MUST NOT create a quote, reserve a quote number, change quote status or persist quote items until the owner confirms the normal quote form

### Requirement: Structured OpenAI response contract
The system MUST request AI output using OpenAI Responses API with Structured Outputs and MUST validate the returned JSON before exposing it to the frontend.

#### Scenario: Valid structured response
- **WHEN** OpenAI returns JSON that matches the configured quote draft schema
- **THEN** the system SHALL normalize and return the draft to the frontend using the application API contract

#### Scenario: Invalid structured response
- **WHEN** OpenAI returns a response that is missing required fields, has invalid types or exceeds configured limits
- **THEN** the system MUST reject the draft and return a recoverable error without exposing raw provider output

#### Scenario: Configurable model
- **WHEN** the AI provider is called
- **THEN** the system SHALL use `gpt-5.4-mini` by default and SHALL allow the model to be overridden by backend environment configuration

### Requirement: Quote draft schema
The AI quote draft response SHALL include enough structured data to prefill the existing quote form while keeping all fields editable by the owner.

#### Scenario: Draft contains expected fields
- **WHEN** a draft is generated successfully
- **THEN** the response SHALL include `customerName`, optional `customerMatchId`, `items`, `notes`, optional `validUntilDays` and `warnings`

#### Scenario: Draft item contains expected fields
- **WHEN** a generated draft includes line items
- **THEN** each item SHALL include `description`, `quantity`, `unit` and optional `catalogMatchId`

#### Scenario: Unknown price is allowed
- **WHEN** the AI cannot determine a safe price from catalog context
- **THEN** the draft SHALL leave the price editable or unset and SHALL NOT invent an authoritative final total

### Requirement: User-scoped context
The system MUST only provide OpenAI with context that belongs to the authenticated owner and is necessary to generate the draft.

#### Scenario: Catalog candidates are scoped
- **WHEN** the backend includes catalog candidates in the AI request
- **THEN** every candidate MUST belong to the authenticated owner and be limited to fields needed for matching and prefill

#### Scenario: Customer candidates are scoped
- **WHEN** the backend includes customer candidates in the AI request
- **THEN** every candidate MUST belong to the authenticated owner and be limited to fields needed for matching and prefill

#### Scenario: Cross-user data is excluded
- **WHEN** two owners have separate customers, catalog items or quotes
- **THEN** an AI draft request from one owner MUST NOT include or return data from the other owner

### Requirement: AI draft safety limits
The system MUST enforce operational limits around AI draft generation to protect privacy, cost and availability.

#### Scenario: Description too long
- **WHEN** the owner submits a description longer than the configured limit
- **THEN** the system MUST reject the request before calling OpenAI

#### Scenario: Provider failure
- **WHEN** OpenAI times out or returns an error
- **THEN** the system SHALL return a user-safe error and SHALL preserve the manual quote creation flow

#### Scenario: Sensitive data is not logged
- **WHEN** the AI draft endpoint handles a request or response
- **THEN** the system MUST NOT log the full prompt, full structured response, API key, JWT, quote share tokens or other secrets
