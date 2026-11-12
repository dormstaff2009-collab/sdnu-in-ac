# SDNU Incident and Accident Reporting - Security Specification

## 1. Data Invariants
- Every incident must contain valid date, category, dormitory location (มน.นิเวศ), victim type, detailed description, action taken, reporter role, reporter name, and valid status.
- Report day must be 1-31, month 1-12, year >= 2000.
- Evidence photos array size is strictly bounded: `photos.size() <= 3`.
- Free text fields are bounded (`maxLength` limits) to prevent Denial of Wallet resource attacks.
- String document IDs must adhere to `^[a-zA-Z0-9_\-]+$` and size <= 128 bytes.
- Timestamps must validate against server time.

## 2. The Dirty Dozen Payloads (Simulated Attack Vectors)
1. **Unbounded Photo Attack**: Attempt to attach 100 images in `photos` array (rejected by `photos.size() <= 3`).
2. **Ghost Fields Injection**: Adding `isAdmin: true` or hidden flags during incident submission (rejected by strict schema validation).
3. **Huge Text DoS**: Submitting 5MB of text in `description` or `actionTaken` (rejected by max string size <= 5000 chars).
4. **Invalid Month/Day**: Submitting `reportMonth: 15` or `reportDay: 40` (rejected by range bounds).
5. **Path ID Poisoning**: Using illegal URL/SQL injection strings as incident ID (rejected by `isValidId`).
6. **Illegal Status Value**: Submitting `status: "deleted"` or arbitrary states (rejected by enum check).
7. **Type Juggling**: Sending numbers or booleans for string fields like `category` or `location`.
8. **Immutability Bypass**: Overwriting `createdAt` during update operations.
9. **Tampering Master Config with malicious types**: Sending objects or code instead of strings in master data arrays.
10. **Arbitrary Collection Creation**: Attempting to write into `/admin_backdoor/` or unauthorized root paths.
11. **Negative Year/Day Attack**: Submitting negative values for dates/counters.
12. **Blanket Query Scraping**: Attempting to query non-existent or restricted collections.

## 3. Rules Strategy
- Default deny catch-all `match /{document=**} { allow read, write: if false; }`.
- Public staff reporting: Staff members, security officers, coordinators, and managers at Naresuan University staff dormitories can submit incident reports, read reports for analytics dashboard, and update progress/resolution status.
- Input validation helpers: `isValidIncident()` and `isValidMasterConfig()`.
