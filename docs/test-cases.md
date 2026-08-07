# Test cases

| Test ID | Feature       | Preconditions                   | Test steps                    | Expected result                      | Actual result               | Status              |
| ------- | ------------- | ------------------------------- | ----------------------------- | ------------------------------------ | --------------------------- | ------------------- |
| TC-01   | Allergy       | Peanuts exists                  | Add `peanuts`                 | Duplicate rejected                   | Automated assertion matches | Pass                |
| TC-02   | Allergy       | Profile open                    | Add whitespace                | Blank rejected                       | Automated assertion matches | Pass                |
| TC-03   | Expiry        | Today fixed                     | Compare yesterday/today/+3/+4 | Four correct statuses                | Automated assertion matches | Pass                |
| TC-04   | Estimation    | Meat, refrigerator              | Add at 1 Aug                  | Estimate 3 Aug                       | Automated assertion matches | Pass                |
| TC-05   | Matching      | 1 of 2 required present         | Calculate                     | 50%, one missing                     | Automated assertion matches | Pass                |
| TC-06   | Matching      | Optional item absent            | Calculate                     | Optional excluded                    | Automated assertion matches | Pass                |
| TC-07   | Filtering     | Alex allergic to peanuts        | Recommend                     | Peanut noodles absent                | Automated assertion matches | Pass                |
| TC-08   | Ranking       | High and low matches            | Score both                    | High match wins                      | Automated assertion matches | Pass                |
| TC-09   | Cooking       | Sufficient stock                | Cook 2 servings               | Quantities deducted                  | Automated assertion matches | Pass                |
| TC-10   | Cooking       | One ingredient short            | Cook                          | Nothing deducted; shortages returned | Automated assertion matches | Pass                |
| TC-11   | Shopping      | Recipe has missing item         | Add missing                   | Item linked to recipe                | Manual demo flow            | Pass                |
| TC-12   | RLS           | Two authenticated test users    | Query/update other's row      | Zero rows returned/changed           | Run against target Supabase | Pending environment |
| TC-13   | Private route | Signed out, Supabase configured | Open `/inventory`             | Redirect to `/login`                 | Route proxy inspection      | Pass                |

For release, run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. Database integration TC-12 must be rerun in the target Supabase project because this repository does not contain credentials.
