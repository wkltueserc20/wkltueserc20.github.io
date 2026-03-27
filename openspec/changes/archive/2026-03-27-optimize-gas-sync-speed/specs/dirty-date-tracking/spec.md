## ADDED Requirements

### Requirement: Client SHALL track dirty dates for changed records
The Client SHALL maintain a set of date strings (YYYYMMDD format) representing dates with unsynchronized local changes. This set SHALL persist in localStorage under the key `baby-sync-dirty-dates`.

#### Scenario: Adding a new record marks its date as dirty
- **WHEN** a user adds a feeding record for 2026-03-25
- **THEN** "20260325" is added to the dirtyDates set in localStorage

#### Scenario: Editing a record marks its date as dirty
- **WHEN** a user edits a record originally on 2026-03-20
- **THEN** "20260320" is added to the dirtyDates set

#### Scenario: Deleting a record marks its date as dirty
- **WHEN** a user soft-deletes a record on 2026-03-22
- **THEN** "20260322" is added to the dirtyDates set

### Requirement: Client SHALL push all dirty dates during sync
During fullSync, the Client SHALL generate push data for ALL dates in the dirtyDates set, not just today and yesterday.

#### Scenario: Push includes backdated record
- **WHEN** a user backdated a record to 2026-03-15 and fullSync triggers
- **THEN** the push array includes `baby_records_20260315.csv` along with any other dirty dates

#### Scenario: No dirty dates means no push
- **WHEN** fullSync triggers but dirtyDates is empty
- **THEN** the push array is empty

### Requirement: Client SHALL clear dirty dates after successful sync
After a successful smartSync response, the Client SHALL clear the dirtyDates set from localStorage.

#### Scenario: Successful sync clears dirty dates
- **WHEN** smartSync returns successfully
- **THEN** the dirtyDates set in localStorage is emptied

#### Scenario: Failed sync preserves dirty dates
- **WHEN** smartSync fails with an error
- **THEN** the dirtyDates set is NOT cleared, ensuring retry on next sync
