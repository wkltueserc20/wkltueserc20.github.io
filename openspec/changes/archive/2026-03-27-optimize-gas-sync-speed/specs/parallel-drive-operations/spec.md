## ADDED Requirements

### Requirement: GAS SHALL use fetchAll for parallel metadata queries
When checking multiple files for MD5 changes, GAS SHALL use `UrlFetchApp.fetchAll()` to query all file metadata in parallel instead of sequential `UrlFetchApp.fetch()` calls.

#### Scenario: Pull 5 files metadata in parallel
- **WHEN** smartSync needs to check 5 files for changes
- **THEN** GAS issues a single `fetchAll()` call with 5 metadata requests, completing in roughly the time of one request instead of five

### Requirement: GAS SHALL use fetchAll for parallel file downloads
When multiple files have changed (MD5 mismatch), GAS SHALL download their content in parallel using `UrlFetchApp.fetchAll()`.

#### Scenario: Two files have changed
- **WHEN** MD5 comparison shows 2 out of 5 files have changed
- **THEN** GAS downloads both files in a single `fetchAll()` call

### Requirement: GAS SHALL use fetchAll for parallel push operations
When pushing multiple CSV files, GAS SHALL perform file search and upload operations in parallel batches using `UrlFetchApp.fetchAll()`.

#### Scenario: Push two dirty date files
- **WHEN** smartSync receives 2 push requests
- **THEN** GAS searches for existing files in one `fetchAll()` call, then uploads both in another `fetchAll()` call

### Requirement: GAS SHALL handle partial fetchAll failures gracefully
If any individual request within a `fetchAll()` batch fails, GAS SHALL continue processing the remaining results and report per-file status in the response.

#### Scenario: One metadata query fails
- **WHEN** fetchAll returns an error for one file but success for others
- **THEN** the failed file is reported as `{status: "error", message: "..."}` and other files are processed normally
