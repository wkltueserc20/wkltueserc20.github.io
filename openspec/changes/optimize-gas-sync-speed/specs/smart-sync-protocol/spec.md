## ADDED Requirements

### Requirement: Client SHALL send a single smartSync request per sync cycle
The Client SHALL combine list, pull, and push operations into a single HTTP POST to the GAS endpoint with `action: "smartSync"`. The Client SHALL NOT call `listRecent` separately before `batchSync`.

#### Scenario: Normal sync cycle
- **WHEN** fullSync is triggered (manual or automatic)
- **THEN** the Client sends exactly one HTTP POST with `action: "smartSync"`, including a `fingerprints` map (fileName → md5) and a `push` array of dirty date CSV data

#### Scenario: No local changes to push
- **WHEN** fullSync is triggered but dirtyDates is empty
- **THEN** the Client sends smartSync with an empty `push` array, and the GAS endpoint still performs the pull (list + compare + download)

### Requirement: GAS SHALL handle smartSync action atomically
The GAS `smartSync` handler SHALL perform list → pull → push in a single execution context, sharing the OAuth token and folderId across all sub-operations.

#### Scenario: smartSync completes full cycle
- **WHEN** GAS receives a smartSync request
- **THEN** GAS calls `getAccessToken()` and `getTargetFolderId()` exactly once, then performs listRecent, pull (with MD5 comparison), and push using the shared token and folderId

#### Scenario: smartSync returns combined results
- **WHEN** GAS completes a smartSync request
- **THEN** the response includes `files` (list of recent file names) and `results` (per-file pull status with md5/csv) in a single JSON response

### Requirement: Legacy actions SHALL remain functional
The GAS endpoint SHALL continue to accept `listRecent` and `batchSync` actions for backward compatibility.

#### Scenario: Old client calls listRecent
- **WHEN** GAS receives `action: "listRecent"`
- **THEN** GAS responds with the same format as before the change
