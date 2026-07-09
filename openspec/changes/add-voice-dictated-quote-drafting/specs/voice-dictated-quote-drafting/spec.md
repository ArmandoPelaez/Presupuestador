## ADDED Requirements

### Requirement: Browser voice dictation availability
The system SHALL offer voice dictation for AI quote drafting only when the current browser exposes a supported speech recognition API.

#### Scenario: Supported browser shows voice controls
- **WHEN** an owner opens the **Crear con IA** flow in a browser with `SpeechRecognition` or `webkitSpeechRecognition`
- **THEN** the application SHALL show controls to start and stop voice dictation for the quote description

#### Scenario: Unsupported browser keeps written flow available
- **WHEN** an owner opens the **Crear con IA** flow in a browser without supported speech recognition
- **THEN** the application MUST keep the written description flow available without requiring voice dictation

### Requirement: Dictated audio becomes editable text
The system SHALL convert recognized speech into editable description text before any AI quote draft is requested.

#### Scenario: Successful dictation appends text
- **WHEN** the owner completes a voice dictation session and the browser returns a final transcript
- **THEN** the application SHALL place the transcribed text in the existing quote description field for review

#### Scenario: Owner can edit transcription before generation
- **WHEN** dictated text appears in the quote description field
- **THEN** the owner SHALL be able to edit, remove or add written text before generating the AI draft

#### Scenario: Existing text is preserved
- **WHEN** the owner starts dictation after already entering text in the quote description field
- **THEN** the application SHALL preserve the existing text and add the final transcription without discarding manual input

### Requirement: Dictation state feedback
The system SHALL provide clear recoverable feedback for voice dictation states and failures.

#### Scenario: Listening state is visible
- **WHEN** the browser is actively capturing voice input
- **THEN** the application SHALL indicate that dictation is listening and SHALL provide a way to stop listening

#### Scenario: Permission denied
- **WHEN** the browser denies microphone or speech recognition permission
- **THEN** the application SHALL show a recoverable message and SHALL keep the written description available

#### Scenario: No recognized speech
- **WHEN** the dictation session ends without recognized speech
- **THEN** the application SHALL show a recoverable message without clearing existing description text

### Requirement: No audio persistence in browser dictation MVP
The system MUST NOT persist, upload or log dictated audio for the browser dictation MVP.

#### Scenario: Dictation completes
- **WHEN** a voice dictation session completes
- **THEN** the application MUST NOT upload an audio file to the backend or persist an audio recording

#### Scenario: Draft generation follows dictation
- **WHEN** the owner generates an AI draft from dictated text
- **THEN** the application MUST send only the reviewed text description through the existing AI quote draft request

#### Scenario: Dictation is cancelled
- **WHEN** the owner cancels or closes the dictation flow before generating a draft
- **THEN** the system MUST NOT create a quote, store audio or persist the transcription
