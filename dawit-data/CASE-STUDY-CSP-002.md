# CSP-002 — FDA Registration Data Cleaning & CRM Preparation

**16,373 validated records · 10,636 companies · 5,737 contacts**

Portfolio case study by Dawit Biru (Dawit Data).
Excel-based data cleaning, validation, entity separation, and CRM import mapping.

This file is documentation for hiring clients. It is not the 16K-row workbook.

## Problem

FDA medical-device registration extracts mix facilities and users in one table. Codes are opaque. Addresses are inconsistent. There is no upsert key. Importing that file into a CRM creates duplicate accounts, blank required fields, and unlinked contacts.

## Results

| Metric | Value |
| --- | --- |
| Source rows | 16,382 |
| Invalid rows excluded | 9 (flagged, retained in raw sheet) |
| Validated records | 16,373 |
| Companies (Facilities) | 10,636 |
| Contacts (Users) | 5,737 |
| Average completeness | 99.95% |
| QA checks | 11 / 11 Pass |

## Method

1. Raw extract preserved as an audit trail.
2. Cleaning and standardization — codes become flags; completeness scored; invalid rows flagged, not silently deleted.
3. Entity separation — Facilities → Companies; Users → Contacts with first/last name split.
4. Quality assurance — volume, blanks, required fields, duplicate primary keys.
5. CRM mapping — Salesforce, HubSpot, Zoho CRM, Dynamics 365. Import Accounts first, then Contacts, matching on External_ID.

## What a client buys

Not the FDA file. The process: cleaned Excel/CSV, invalid-row audit, optional Company/Contact split, short QA note, optional CRM field mapping.

Packages: Starter (≤500 rows), Standard (≤2,000), CRM-ready (≤5,000).

## Contact

Dawit Biru · Addis Ababa, Ethiopia (remote)
dawitassisstant@gmail.com
https://github.com/Dawit1621
