# CSP-002 — FDA Registration Data Cleaning & CRM Preparation

**16,373 validated records · 10,636 companies · 5,737 contacts**

Portfolio case study by Dawit Biru (Dawit Data).  
Excel-based data cleaning, validation, entity separation, and CRM import mapping.

This file is documentation for hiring clients. It is not the 16K-row workbook.

---

## Problem

FDA medical-device registration extracts mix facilities and users in one table. Codes are opaque (F/U, Y/N, status IDs). Addresses are inconsistent. There is no upsert key. Importing that file into a CRM creates duplicate accounts, blank required fields, and unlinked contacts.

The assignment: produce CRM-ready Company and Contact tables, with documented quality checks and field mapping for Salesforce, HubSpot, Zoho CRM, and Dynamics 365.

---

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

---

## Method

1. **Raw extract preserved** — original sheet frozen as an audit trail.
2. **Cleaning and standardization** — codes become readable flags; addresses normalized; completeness scored; invalid rows flagged, not silently deleted.
3. **Entity separation** — Facilities → Companies (Account). Users → Contacts with first/last name split and a link to the registration key.
4. **Quality assurance** — volume, blanks, required fields, duplicate primary keys.
5. **CRM mapping** — each Excel field mapped to four CRMs. Import templates use External_ID as the upsert key. Import Accounts first, then Contacts.

---

## Workbook structure (14 sheets)

| Sheet | Purpose |
| --- | --- |
| 00_Instructions | Scope, status, navigation |
| 01_Raw | Original extract (audit trail) |
| 02_Cleaned | Master + derived fields |
| 03_Companies | Account-ready facilities |
| 04_Contacts | Contact-ready users |
| 05_Dashboard | KPIs and region mix |
| 06_CRM_Mapping | Salesforce · HubSpot · Zoho · Dynamics |
| 07_Import_Templates | Wizard-ready headers |
| 08_Workflow | Process map |
| 09_Before_After | Client-facing contrast |
| 10_QA | 11 health checks |
| 11_Data_Dictionary | Field definitions |
| 12_Formula_Docs | Transformation logic |
| 13_Change_Log | Version history |

---

## What a client buys

Not the FDA file. The process:

- Cleaned Excel/CSV
- Invalid-row audit
- Optional Company/Contact split
- Short QA note
- Optional CRM field mapping

Packages: Starter (≤500 rows), Standard (≤2,000), CRM-ready (≤5,000). Larger files are quoted after a sample review.

---

## Positioning

Present as **data cleaning and CRM preparation**.  
Do not present as generic data entry, Salesforce admin, or software development.

---

## Contact

Dawit Biru · Addis Ababa, Ethiopia (remote)  
dawitassisstant@gmail.com  
https://github.com/Dawit1621
