---
title: "PMTwin Collaboration Models: Comprehensive Technical Specification"
---

# Overview

> This document defines the complete collaboration model framework for the PMTwin platform. Each model and sub-model is specified with detailed attributes, metrics, applicability, and decision criteria to enable:

- Platform digitization and database schema design

- AI chatbot wizard for guiding users to the right collaboration type

- Matching algorithms and filtering logic

- Smart contract generation and automation

- Analytics and reporting

## Key Principles {#key-principles .unnumbered}

1.  **User-Centric Design:** Models are organized by user intent (project-specific vs. strategic, short-term vs. long-term)

2.  **Comprehensive Coverage:** From individual freelancers to mega-project developers

3.  **Data-Driven Matching:** All attributes are quantifiable or categorizable for algorithmic matching

# Model Hierarchy

1.  **Model 1: Project-Based Collaboration**

## Model Definition {#model-definition .unnumbered}

> **Purpose:** Partnerships formed to deliver specific projects or defined objectives with a clear start and end point.

### Core Characteristics: {#core-characteristics .unnumbered}

- Project-specific focus (not ongoing business operations)

- Defined scope, timeline, and deliverables

- Collaboration ends upon project completion

- Shared or coordinated execution

> **Applicability:** B2B, B2P, P2B, P2P

# Sub-Model 1.1: Task-Based Engagement {#sub-model-1.1-task-based-engagement}

> **Description**
>
> Short-term collaboration for executing specific tasks, deliverables, or providing expert consultation. This is the simplest form of project collaboration, typically involving one party hiring another to complete a discrete piece of work.
>
> **Use Cases**

- Hiring a structural engineer to review and approve shop drawings

- Engaging a quantity surveyor to prepare a bill of quantities for a tender

- Contracting a BIM specialist to create 3D models for a specific building

- Hiring a legal consultant to review a construction contract

- Engaging a safety officer for a 3-month project phase

> **Applicability**

<table>
<colgroup>
<col style="width: 26%" />
<col style="width: 16%" />
<col style="width: 57%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Company hires another company for specific task</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>B2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Company hires individual professional/SM</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p>P2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Professional offers services to companies</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>P2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Professional hires another professional for support</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Key Attributes**

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 21%" />
<col style="width: 35%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Task Title</strong></p>
</blockquote></td>
<td><blockquote>
<p>String (100 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Brief description of the task</p>
</blockquote></td>
<td><blockquote>
<p>"What is the task you need completed?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Task Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Category of work</p>
</blockquote></td>
<td><blockquote>
<p>"What type of work is this?" (Design</p>
<p>/ Engineering / Consultation / Review / Analysis / Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Detailed Scope</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (2000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Full description of deliverables</p>
</blockquote></td>
<td><blockquote>
<p>"Please describe the detailed scope and deliverables"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Duration</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer (days)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Expected completion time</p>
</blockquote></td>
<td><blockquote>
<p>"How many days/weeks do you expect this to take?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Budget Range</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency Range</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Min-Max budget or fixed price</p>
</blockquote></td>
<td><blockquote>
<p>"What is your budget range?" (Fixed Price / Hourly Rate / Budget Range)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Required Skills</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Skills/certifications needed</p>
</blockquote></td>
<td><blockquote>
<p>"What skills or certifications are required?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Experience Level</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Seniority required</p>
</blockquote></td>
<td><blockquote>
<p>"What experience level do you need?" (Junior / Mid-Level / Senior / Expert)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Location Requirement</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>On-site vs. remote</p>
</blockquote></td>
<td><blockquote>
<p>"Does this work require on-site presence?" (Remote / On-Site / Hybrid)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Start Date</strong></p>
</blockquote></td>
<td><blockquote>
<p>Date</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>When work should begin</p>
</blockquote></td>
<td><blockquote>
<p>"When do you need this to start?"</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 21%" />
<col style="width: 35%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Deliverable Format</strong></p>
</blockquote></td>
<td><blockquote>
<p>String</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Expected output format</p>
</blockquote></td>
<td><blockquote>
<p>"What format should the deliverables be in?" (e.g., PDF report, CAD files, Excel spreadsheet)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Payment Terms</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Payment structure</p>
</blockquote></td>
<td><blockquote>
<p>"What are the payment terms?" (Upfront / Milestone-Based / Upon Completion / Monthly)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Exchange Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Monetary or barter</p>
</blockquote></td>
<td><blockquote>
<p>"How will you compensate?" (Cash / Barter / Mixed)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Barter Offer</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (500 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Conditional</p>
</blockquote></td>
<td><blockquote>
<p>If barter, what is offered</p>
</blockquote></td>
<td><blockquote>
<p>"What are you offering in exchange?" (Only if Exchange Type</p>
<p>= Barter/Mixed)</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Metrics for Matching**

<table>
<colgroup>
<col style="width: 22%" />
<col style="width: 33%" />
<col style="width: 43%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Skill Match Score</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match required skills to professional's profile</p>
</blockquote></td>
<td><blockquote>
<p>(Matching Skills / Required Skills) × 100</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Experience Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify experience level alignment</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (meets minimum experience level)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Availability Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Ensure professional is available</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (professional available during required dates)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Budget Compatibility</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match budget to professional's rates</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (professional's rate within budget range)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Location Compatibility</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match location requirements</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (professional can work in required location/mode)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Past Performance Score</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prioritize high-performing professionals</p>
</blockquote></td>
<td><blockquote>
<p>Average rating from past Task-Based engagements (0-5)</p>
</blockquote></td>
</tr>
</tbody>
</table>

# Sub-Model 1.2: Consortium {#sub-model-1.2-consortium}

> **Description**
>
> A temporary contractual alliance among independent entities (companies or professionals) formed to pursue a specific opportunity, typically a large tender or project. Each member retains their legal independence and is responsible for their defined scope of work. No new legal entity is created.
>
> **Use Cases**

- Three construction companies form a consortium to bid on a \$100M government infrastructure tender

- Regional contractors partner to deliver a large hospital project, each handling different trades

- Engineering firms collaborate on a complex design-build project

- Contractors and suppliers form a consortium to deliver a turnkey facility

> **Applicability**

<table>
<colgroup>
<col style="width: 21%" />
<col style="width: 13%" />
<col style="width: 64%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Primary use case: companies collaborating</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>B2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Companies can include individual professionals as consortium members</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p>P2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Professionals can join company-led consortia</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>P2P</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Rare; typically consortia involve companies</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Key Attributes**

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 19%" />
<col style="width: 35%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Project Title</strong></p>
</blockquote></td>
<td><blockquote>
<p>String (150 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Name of the project/tender</p>
</blockquote></td>
<td><blockquote>
<p>"What is the project or tender you're pursuing?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Project Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Category of project</p>
</blockquote></td>
<td><blockquote>
<p>"What type of project is this?" (Infrastructure / Building / Industrial / Energy / Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Project Value</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Total estimated value</p>
</blockquote></td>
<td><blockquote>
<p>"What is the total project value?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Project Duration</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer (months)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Expected timeline</p>
</blockquote></td>
<td><blockquote>
<p>"How long is the project expected to take?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Project Location</strong></p>
</blockquote></td>
<td><blockquote>
<p>String</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>City/Region</p>
</blockquote></td>
<td><blockquote>
<p>"Where is the project located?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Lead Member</strong></p>
</blockquote></td>
<td><blockquote>
<p>Boolean</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Is poster the lead?</p>
</blockquote></td>
<td><blockquote>
<p>"Will you be the lead member of this consortium?"</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 19%" />
<col style="width: 35%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Required Members</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Number of partners needed</p>
</blockquote></td>
<td><blockquote>
<p>"How many consortium members do you need?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Member Roles</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Scope for each member</p>
</blockquote></td>
<td><blockquote>
<p>"What roles/scopes do you need filled?" (e.g., Civil Works, MEP, Finishes)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Scope Division</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How work is divided</p>
</blockquote></td>
<td><blockquote>
<p>"How will the work be divided?" (By Trade / By Phase / By Geography / Mixed)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>Liability Structure</p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Liability arrangement</p>
</blockquote></td>
<td><blockquote>
<p>"What liability structure?" (Individual</p>
<p>/ Joint &amp; Several / Mixed)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Client Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Who is the client</p>
</blockquote></td>
<td><blockquote>
<p>"Who is the client?" (Government / Private / PPP / Other)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Tender Deadline</strong></p>
</blockquote></td>
<td><blockquote>
<p>Date</p>
</blockquote></td>
<td><blockquote>
<p>Conditional</p>
</blockquote></td>
<td><blockquote>
<p>If bidding on tender</p>
</blockquote></td>
<td><blockquote>
<p>"When is the tender deadline?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Prequalification Required</strong></p>
</blockquote></td>
<td><blockquote>
<p>Boolean</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Are members pre- qualified</p>
</blockquote></td>
<td><blockquote>
<p>"Do consortium members need to be prequalified?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Minimum Requirements</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Qualifications needed</p>
</blockquote></td>
<td><blockquote>
<p>"What are the minimum requirements for members?" (Financial capacity, experience, certifications)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Consortium Agreement</strong></p>
</blockquote></td>
<td><blockquote>
<p>Boolean</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Will formal agreement be signed</p>
</blockquote></td>
<td><blockquote>
<p>"Will there be a formal consortium agreement?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Payment Distribution</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How revenue is shared</p>
</blockquote></td>
<td><blockquote>
<p>"How will payments be distributed?" (Per Scope / Proportional / Fixed Percentage)</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Metrics for Matching**

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 31%" />
<col style="width: 42%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Scope Match Score</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match member capabilities to required scopes</p>
</blockquote></td>
<td><blockquote>
<p>(Member's expertise in required scope) × 100</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Financial Capacity</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify member can handle project scale</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (member's annual revenue &gt;= required threshold)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Experience Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify relevant project experience</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (member has completed similar projects)</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 31%" />
<col style="width: 42%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Geographic Proximity</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prefer local members</p>
</blockquote></td>
<td><blockquote>
<p>Distance from project location (km)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Prequalification Status</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify eligibility</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (member has required certifications/licenses)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Past Collaboration Score</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prioritize proven partners</p>
</blockquote></td>
<td><blockquote>
<p>Average rating from past Consortium projects (0-5)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Complementary Capabilities</strong></p>
</blockquote></td>
<td><blockquote>
<p>Ensure no overlap</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (member's scope complements existing members)</p>
</blockquote></td>
</tr>
</tbody>
</table>

# Sub-Model 1.3: Project-Specific Joint Venture {#sub-model-1.3-project-specific-joint-venture}

> **Description**
>
> A formal partnership between two or more parties to collaborate on a **single, specific project** or defined objective. Unlike a consortium, a Joint Venture involves deeper integration, shared management, and often the creation of a new legal entity (Incorporated JV) or a detailed contractual agreement (Contractual JV). The JV dissolves upon project completion.
>
> **Use Cases**

- Two contractors form an incorporated JV to execute a \$50M commercial tower project

- Developer and contractor form a contractual JV to build and sell a residential compound

- Local contractor and international firm form JV to deliver a specialized industrial facility

- Engineering firms create JV entity to provide integrated design services for a mega- project

> **Applicability**

<table>
<colgroup>
<col style="width: 21%" />
<col style="width: 13%" />
<col style="width: 64%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Primary use case: companies forming JV</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>B2P</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Rare; typically JVs are between companies</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p>P2B</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Rare; professionals usually hired as consultants</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 21%" />
<col style="width: 13%" />
<col style="width: 64%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>P2P</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Professionals typically use simpler Task-Based or partnership structures</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Key Attributes**

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 19%" />
<col style="width: 37%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Project Title</strong></p>
</blockquote></td>
<td><blockquote>
<p>String (150 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Name of the project</p>
</blockquote></td>
<td><blockquote>
<p>"What is the project you want to collaborate on?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Project Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Category of project</p>
</blockquote></td>
<td><blockquote>
<p>"What type of project is this?" (Building</p>
<p>/ Infrastructure / Industrial / Energy / Real Estate Development / Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Project Value</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Total estimated value</p>
</blockquote></td>
<td><blockquote>
<p>"What is the total project value?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Project Duration</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer (months)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Expected timeline</p>
</blockquote></td>
<td><blockquote>
<p>"How long will this project take?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Project Location</strong></p>
</blockquote></td>
<td><blockquote>
<p>String</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>City/Region</p>
</blockquote></td>
<td><blockquote>
<p>"Where is the project located?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>JV Structure</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Legal form</p>
</blockquote></td>
<td><blockquote>
<p>"What type of JV structure?" (Contractual / Incorporated LLC / Incorporated Corporation)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Equity Split</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Decimals</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Ownership percentages</p>
</blockquote></td>
<td><blockquote>
<p>"How will ownership/equity be split?" (e.g., 50-50, 60-40)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Capital Contribution</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Total capital needed</p>
</blockquote></td>
<td><blockquote>
<p>"What is the total capital contribution required?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Partner Roles</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Responsibilities of each partner</p>
</blockquote></td>
<td><blockquote>
<p>"What will each partner contribute?" (Capital / Expertise / Equipment / Labor / Market Access)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Management Structure</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How JV is managed</p>
</blockquote></td>
<td><blockquote>
<p>"How will the JV be managed?" (Equal Management / Lead Partner / Management Committee / Professional Manager)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Profit Distribution</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How profits are shared</p>
</blockquote></td>
<td><blockquote>
<p>"How will profits be distributed?" (Proportional to Equity / Fixed Percentage / Performance-Based)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Risk Allocation</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (1000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How risks are shared</p>
</blockquote></td>
<td><blockquote>
<p>"How will risks and liabilities be allocated?"</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 19%" />
<col style="width: 37%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Exit Strategy</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How JV ends</p>
</blockquote></td>
<td><blockquote>
<p>"What happens after project completion?" (Dissolution / Asset Sale</p>
<p>/ Buyout Option / Conversion to Strategic JV)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Governance</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (1000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Conditional</p>
</blockquote></td>
<td><blockquote>
<p>If incorporated</p>
</blockquote></td>
<td><blockquote>
<p>"What governance structure will the JV have?" (Board composition, voting rights, decision-making)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Dispute Resolution</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Conflict mechanism</p>
</blockquote></td>
<td><blockquote>
<p>"How will disputes be resolved?" (Arbitration / Mediation / Court / Other)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Partner Requirements</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Qualifications needed</p>
</blockquote></td>
<td><blockquote>
<p>"What qualifications do you need from partners?" (Financial capacity, experience, licenses)</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Metrics for Matching**

<table>
<colgroup>
<col style="width: 23%" />
<col style="width: 27%" />
<col style="width: 48%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Complementary Capabilities</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match partners with different strengths</p>
</blockquote></td>
<td><blockquote>
<p>Compatibility score based on what each partner brings (capital, expertise, equipment, etc.)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Financial Capacity</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify partner can contribute required capital</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (partner's financial capacity &gt;= required contribution)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Strategic Fit</strong></p>
</blockquote></td>
<td><blockquote>
<p>Assess alignment of business goals</p>
</blockquote></td>
<td><blockquote>
<p>Qualitative assessment based on partner's stated objectives</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Experience Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify relevant project experience</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (partner has completed similar projects)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Risk Tolerance</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match risk appetite</p>
</blockquote></td>
<td><blockquote>
<p>Alignment between partner's risk profile and project risk level</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Past JV Performance</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prioritize proven JV partners</p>
</blockquote></td>
<td><blockquote>
<p>Average rating from past JV collaborations (0-5)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Equity Alignment</strong></p>
</blockquote></td>
<td><blockquote>
<p>Ensure equity expectations match</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (partner's expected equity % aligns with offer)</p>
</blockquote></td>
</tr>
</tbody>
</table>

# Sub-Model 1.4: Special Purpose Vehicle (SPV) {#sub-model-1.4-special-purpose-vehicle-spv}

> **Description**
>
> A separate legal entity created specifically to isolate financial risk for a **single, large-scale, capital-intensive project**. The SPV is \"bankruptcy-remote,\" meaning its financial health is independent of its parent company or sponsors. SPVs are the industry standard for mega-
>
> projects, infrastructure, and Public-Private Partnerships (PPPs) where significant external financing is required.
>
> **Use Cases**

- \$500M toll road PPP project structured through an SPV

- \$200M mixed-use development with multiple investors and lenders

- Energy plant (solar, wind, gas) requiring project finance

- Large-scale infrastructure (airport, seaport, water treatment facility)

- Real estate development with complex financing and risk isolation needs

> **Applicability**

<table>
<colgroup>
<col style="width: 23%" />
<col style="width: 14%" />
<col style="width: 62%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Primary use case: companies forming SPV</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>B2P</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>SPVs are corporate structures, not for individual professionals</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p>P2B</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Professionals may be hired BY the SPV, but don't form SPVs</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>P2P</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Not applicable</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Key Attributes**

<table>
<colgroup>
<col style="width: 18%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 22%" />
<col style="width: 34%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Project Title</strong></p>
</blockquote></td>
<td><blockquote>
<p>String (150 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Name of the project</p>
</blockquote></td>
<td><blockquote>
<p>"What is the project name?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Project Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Category of project</p>
</blockquote></td>
<td><blockquote>
<p>"What type of project is this?" (Infrastructure / Energy / Real Estate / PPP / Industrial / Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Project Value</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Total estimated value</p>
</blockquote></td>
<td><blockquote>
<p>"What is the total project value?" (Minimum 50M SAR)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Project Duration</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer (years)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Expected lifecycle</p>
</blockquote></td>
<td><blockquote>
<p>"How long is the project lifecycle?" (Typically 20-30 years)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Project Location</strong></p>
</blockquote></td>
<td><blockquote>
<p>String</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>City/Region</p>
</blockquote></td>
<td><blockquote>
<p>"Where is the project located?"</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 18%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 22%" />
<col style="width: 34%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>SPV Legal Form</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Legal structure</p>
</blockquote></td>
<td><blockquote>
<p>"What legal form will the SPV take?" (LLC / Limited Partnership / Corporation / Trust)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Sponsors</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Parent companies/investors</p>
</blockquote></td>
<td><blockquote>
<p>"Who are the sponsors/parent companies?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Equity Structure</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Ownership breakdown</p>
</blockquote></td>
<td><blockquote>
<p>"How will equity be structured?" (Sponsor names and percentages)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Debt Financing</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Amount of debt needed</p>
</blockquote></td>
<td><blockquote>
<p>"How much debt financing is required?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Debt Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Type of debt</p>
</blockquote></td>
<td><blockquote>
<p>"What type of debt?" (Non- Recourse / Limited Recourse / Recourse)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Lenders</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Target lenders</p>
</blockquote></td>
<td><blockquote>
<p>"Who are the target lenders?" (Banks, IFC, ADB, etc.)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Project Phase</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Current stage</p>
</blockquote></td>
<td><blockquote>
<p>"What phase is the project in?" (Concept / Feasibility / Financing / Construction / Operation)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Revenue Model</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How SPV generates revenue</p>
</blockquote></td>
<td><blockquote>
<p>"What is the revenue model?" (User Fees / Government Payments / Asset Sale / Lease / Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Risk Allocation</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (2000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How risks are distributed</p>
</blockquote></td>
<td><blockquote>
<p>"How will risks be allocated among sponsors, lenders, and contractors?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Governance Structure</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (1000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Board and management</p>
</blockquote></td>
<td><blockquote>
<p>"What is the SPV's governance structure?" (Board composition, management team)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Regulatory Approvals</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Required permits/licenses</p>
</blockquote></td>
<td><blockquote>
<p>"What regulatory approvals are needed?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Exit Strategy</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How SPV ends</p>
</blockquote></td>
<td><blockquote>
<p>"What is the exit strategy?" (Asset Transfer / Liquidation / Sale / Conversion to Permanent Entity)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Professional Services Needed</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Enums</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Advisors required</p>
</blockquote></td>
<td><blockquote>
<p>"What professional services do you need?" (Legal / Financial / Technical / Environmental / Other)</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Metrics for Matching**

<table>
<colgroup>
<col style="width: 21%" />
<col style="width: 33%" />
<col style="width: 44%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Financial Capacity</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify sponsor can contribute equity</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (sponsor's net worth &gt;= required equity contribution)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Project Experience</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify relevant mega-project experience</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (sponsor has completed projects &gt;= 50M SAR)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Sector Expertise</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match sector-specific experience</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (sponsor has experience in project sector)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Risk Profile Alignment</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match risk tolerance</p>
</blockquote></td>
<td><blockquote>
<p>Alignment between sponsor's risk appetite and project risk level</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Geographic Presence</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prefer sponsors with local presence</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (sponsor has operations in project region)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Lender Relationships</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prioritize sponsors with strong lender networks</p>
</blockquote></td>
<td><blockquote>
<p>Qualitative assessment of sponsor's banking relationships</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Past SPV Performance</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prioritize proven SPV sponsors</p>
</blockquote></td>
<td><blockquote>
<p>Average performance rating from past SPV projects (0-5)</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Special Platform Features for SPV**

### Educational Resources:

- \"What is an SPV?\" guide

- \"When do you need an SPV?\" decision wizard

- SPV vs. JV comparison tool

- Case studies from Saudi mega-projects

### Professional Service Marketplace:

- Vetted law firms specializing in SPV formation

- Financial advisors for project finance

- Technical consultants for feasibility studies

- Platform earns referral fees (10-20%)

### SPV Formation Checklist:

- Required documents

- Regulatory approvals

- Timeline estimates

- Cost projections

### Phase 2+ Features:

- SPV project marketplace

- Investor matching

- Governance tools (board meetings, compliance tracking)

- Financial reporting integration

# Model 2: Strategic Partnerships

## Model Definition {#model-definition-1 .unnumbered}

> **Purpose:** Long-term alliances formed for ongoing collaboration, mutual growth, and strategic objectives that extend beyond a single project.

### Core Characteristics: {#core-characteristics-1 .unnumbered}

- Long-term or indefinite duration (10+ years)

- Strategic alignment and shared vision

- May span multiple projects or business activities

- Focus on capability enhancement, market access, or innovation

- Deeper relationship than project-specific collaboration

> **Applicability:** B2B, B2P, P2B, P2P

# Sub-Model 2.1: Strategic Joint Venture {#sub-model-2.1-strategic-joint-venture}

> **Description**
>
> A long-term partnership between two or more parties that creates a **new, ongoing business entity** or establishes a **permanent collaborative relationship** that may pursue multiple projects or business opportunities over many years. Unlike a Project-Specific JV, a Strategic JV is not limited to a single project and may evolve into a permanent business.
>
> **Use Cases**

- Saudi contractor + European technology firm form JV to deliver smart buildings across multiple projects over 15 years

- Developer + hospitality operator form JV to develop and operate a hotel chain

- Local contractor + international EPC firm form JV to pursue energy projects in the Gulf region

- Manufacturing JV that produces construction materials for both parent companies indefinitely

- Engineering firms create permanent JV entity to offer integrated services across sectors

> **Applicability**

<table>
<colgroup>
<col style="width: 23%" />
<col style="width: 14%" />
<col style="width: 62%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Primary use case: companies forming strategic JV</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>B2P</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Rare; typically strategic JVs are between companies</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p>P2B</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Rare; professionals usually hired as employees or consultants</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>P2P</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Professionals typically form LLPs or partnerships, not JVs</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Key Attributes**

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 21%" />
<col style="width: 35%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>JV Name</strong></p>
</blockquote></td>
<td><blockquote>
<p>String (150 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Name of the JV entity or partnership</p>
</blockquote></td>
<td><blockquote>
<p>"What will the JV be called?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Strategic Objective</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (1000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Long-term goals</p>
</blockquote></td>
<td><blockquote>
<p>"What are the strategic objectives of this JV?" (Market expansion, technology transfer, capability building, etc.)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Business Scope</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (1000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Activities the JV will pursue</p>
</blockquote></td>
<td><blockquote>
<p>"What business activities will the JV pursue?" (Multiple projects, ongoing operations, manufacturing, services, etc.)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Target Sectors</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Enums</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Industries/sectors</p>
</blockquote></td>
<td><blockquote>
<p>"What sectors will the JV operate in?" (Construction / Energy / Real Estate / Manufacturing / Technology</p>
<p>/ Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Geographic Scope</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Markets/regions</p>
</blockquote></td>
<td><blockquote>
<p>"What geographic markets will the JV serve?" (Saudi Arabia / GCC / MENA / Global)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Duration</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Expected lifespan</p>
</blockquote></td>
<td><blockquote>
<p>"How long do you envision this JV lasting?" (10-15 years / 15-20 years / Indefinite / Until specific milestone)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>JV Structure</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Legal form</p>
</blockquote></td>
<td><blockquote>
<p>"What legal structure?" (Incorporated LLC / Incorporated Corporation / Limited Partnership)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Equity Split</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Decimals</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Ownership percentages</p>
</blockquote></td>
<td><blockquote>
<p>"How will ownership be split?" (e.g., 50-50, 60-40)</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 21%" />
<col style="width: 35%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Initial Capital</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Startup capital</p>
</blockquote></td>
<td><blockquote>
<p>"What is the initial capital contribution?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Ongoing Funding</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How JV is funded</p>
</blockquote></td>
<td><blockquote>
<p>"How will the JV be funded ongoing?" (Partner Contributions / Retained Earnings / External Financing / Mixed)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Partner Contributions</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>What each partner brings</p>
</blockquote></td>
<td><blockquote>
<p>"What will each partner contribute?" (Capital / Technology / Market Access / Brand / Expertise / Assets)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Management Structure</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How JV is managed</p>
</blockquote></td>
<td><blockquote>
<p>"How will the JV be managed?" (Equal Management / Lead Partner / Professional CEO / Management Committee)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Governance</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (1000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Board and decision- making</p>
</blockquote></td>
<td><blockquote>
<p>"What is the governance structure?" (Board composition, voting rights, veto powers)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Profit Distribution</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How profits are shared</p>
</blockquote></td>
<td><blockquote>
<p>"How will profits be distributed?" (Proportional to Equity / Reinvested / Performance-Based)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Exit Options</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Enums</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How partners can exit</p>
</blockquote></td>
<td><blockquote>
<p>"What exit options are available?" (Buyout / IPO / Sale to Third Party / Dissolution)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Non-Compete</strong></p>
</blockquote></td>
<td><blockquote>
<p>Boolean</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Restrictions on partners</p>
</blockquote></td>
<td><blockquote>
<p>"Will there be non-compete clauses for partners?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Technology Transfer</strong></p>
</blockquote></td>
<td><blockquote>
<p>Boolean</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Is tech transfer involved</p>
</blockquote></td>
<td><blockquote>
<p>"Does this JV involve technology or knowledge transfer?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Partner Requirements</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Qualifications needed</p>
</blockquote></td>
<td><blockquote>
<p>"What do you need from partners?" (Financial capacity, expertise, market presence, technology, brand)</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Metrics for Matching**

<table>
<colgroup>
<col style="width: 22%" />
<col style="width: 32%" />
<col style="width: 44%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Strategic Alignment</strong></p>
</blockquote></td>
<td><blockquote>
<p>Assess compatibility of long-term goals</p>
</blockquote></td>
<td><blockquote>
<p>Qualitative assessment based on stated objectives</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Complementary Strengths</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match partners with different capabilities</p>
</blockquote></td>
<td><blockquote>
<p>Compatibility score: what each partner brings (capital, tech, market, brand)</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 22%" />
<col style="width: 32%" />
<col style="width: 44%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Financial Capacity</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify partner can sustain long- term commitment</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (partner's financial strength &gt;= required contribution)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Market Presence</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match geographic/sector presence</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (partner has presence in target markets)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Technology Fit</strong></p>
</blockquote></td>
<td><blockquote>
<p>Assess technology compatibility</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (partner's technology complements or enhances JV objectives)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Cultural Compatibility</strong></p>
</blockquote></td>
<td><blockquote>
<p>Assess organizational culture fit</p>
</blockquote></td>
<td><blockquote>
<p>Qualitative assessment (may require interviews/meetings)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Past JV Performance</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prioritize proven strategic partners</p>
</blockquote></td>
<td><blockquote>
<p>Average rating from past Strategic JV collaborations (0-5)</p>
</blockquote></td>
</tr>
</tbody>
</table>

## Sub-Model 2.2: Long-Term Strategic Alliance {#sub-model-2.2-long-term-strategic-alliance .unnumbered}

> **Description**
>
> An ongoing partnership between two or more parties for mutual benefit **without forming a new legal entity**. Strategic Alliances are based on contractual agreements and focus on specific areas of collaboration such as preferred supplier relationships, technology licensing, market access, or capability sharing.
>
> **Use Cases**

- Contractor establishes preferred supplier agreement with materials manufacturer for all projects

- Technology company licenses BIM software to construction firm with ongoing support and training

- Local contractor partners with international firm for market access and knowledge transfer

- Engineering firm and sustainability consultant form alliance to jointly offer green building services

- Equipment supplier and contractor establish long-term rental and maintenance partnership

> **Applicability**

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 13%" />
<col style="width: 65%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Primary use case: companies forming alliances</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 13%" />
<col style="width: 65%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Companies can form alliances with individual professionals (e.g., preferred consultant)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>P2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Professionals can establish ongoing relationships with companies</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p>P2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Professionals can form alliances (e.g., architect + engineer partnership)</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Key Attributes**

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 11%" />
<col style="width: 12%" />
<col style="width: 20%" />
<col style="width: 38%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Alliance Title</strong></p>
</blockquote></td>
<td><blockquote>
<p>String (150</p>
<p>chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Name/description of alliance</p>
</blockquote></td>
<td><blockquote>
<p>"What is this strategic alliance for?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Alliance Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Category of alliance</p>
</blockquote></td>
<td><blockquote>
<p>"What type of alliance is this?" (Preferred Supplier / Technology Licensing / Market Access / Knowledge Sharing / Joint Service Offering / Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Strategic Objective</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (1000</p>
<p>chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Goals of the alliance</p>
</blockquote></td>
<td><blockquote>
<p>"What are the strategic objectives?" (Cost reduction, capability enhancement, market expansion, etc.)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Scope of Collaboration</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (1000</p>
<p>chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>What partners will do together</p>
</blockquote></td>
<td><blockquote>
<p>"What will you collaborate on?" (Supply of materials, technology access, joint bidding, knowledge transfer, etc.)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Duration</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer (years)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Expected lifespan</p>
</blockquote></td>
<td><blockquote>
<p>"How long will this alliance last?" (Minimum 3 years for strategic alliance)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Exclusivity</strong></p>
</blockquote></td>
<td><blockquote>
<p>Boolean</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Is this exclusive</p>
</blockquote></td>
<td><blockquote>
<p>"Will this be an exclusive arrangement?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Geographic Scope</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Markets covered</p>
</blockquote></td>
<td><blockquote>
<p>"What geographic areas does this cover?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Financial Terms</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (1000</p>
<p>chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Commercial arrangement</p>
</blockquote></td>
<td><blockquote>
<p>"What are the financial terms?" (Pricing, discounts, revenue sharing, licensing fees, etc.)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Performance Metrics</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How success is measured</p>
</blockquote></td>
<td><blockquote>
<p>"What are the key performance indicators?" (Volume, quality, response time, cost savings, etc.)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Governance</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (500 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How alliance is managed</p>
</blockquote></td>
<td><blockquote>
<p>"How will this alliance be managed?" (Regular meetings, joint steering committee, etc.)</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 11%" />
<col style="width: 12%" />
<col style="width: 20%" />
<col style="width: 38%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Termination Conditions</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (500 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How alliance can end</p>
</blockquote></td>
<td><blockquote>
<p>"Under what conditions can this alliance be terminated?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Partner Requirements</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Qualifications needed</p>
</blockquote></td>
<td><blockquote>
<p>"What do you need from your alliance partner?" (Capabilities, capacity, certifications, geographic presence)</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Metrics for Matching**

<table>
<colgroup>
<col style="width: 23%" />
<col style="width: 34%" />
<col style="width: 42%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Capability Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match partner capabilities to alliance needs</p>
</blockquote></td>
<td><blockquote>
<p>Compatibility score based on required vs. offered capabilities</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Geographic Coverage</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match geographic presence</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (partner has presence in required markets)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Capacity Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify partner can handle volume/scale</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (partner's capacity &gt;= required volume)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Quality Standards</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify partner meets quality requirements</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (partner has required certifications/quality systems)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Financial Stability</strong></p>
</blockquote></td>
<td><blockquote>
<p>Ensure partner can sustain long- term relationship</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (partner's financial health is strong)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Past Alliance Performance</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prioritize proven alliance partners</p>
</blockquote></td>
<td><blockquote>
<p>Average rating from past Strategic Alliances (0-5)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Cultural Fit</strong></p>
</blockquote></td>
<td><blockquote>
<p>Assess compatibility for long-term relationship</p>
</blockquote></td>
<td><blockquote>
<p>Qualitative assessment</p>
</blockquote></td>
</tr>
</tbody>
</table>

## Sub-Model 2.3: Mentorship Program {#sub-model-2.3-mentorship-program .unnumbered}

> **Description**
>
> A relationship where an experienced professional (mentor) provides guidance, knowledge transfer, and career development support to a less experienced professional (mentee). This can be formal or informal, paid or unpaid, and may be facilitated by companies or professional associations.
>
> **Use Cases**

- Senior project manager mentors junior PM on complex project delivery

- Experienced architect guides young architect through design and client management

- Veteran contractor mentors startup construction company owner

- Professional engineer provides technical mentorship to recent graduate

- Business owner mentors aspiring entrepreneur in construction industry

> **Applicability**

<table>
<colgroup>
<col style="width: 23%" />
<col style="width: 14%" />
<col style="width: 62%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2B</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Rare; mentorship is typically individual-focused</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>B2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Company-sponsored mentorship programs for professionals</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p>P2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Professional offers mentorship services to company employees</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>P2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Primary use case: individual mentor and mentee</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Key Attributes**

<table>
<colgroup>
<col style="width: 18%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 17%" />
<col style="width: 39%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Mentorship Title</strong></p>
</blockquote></td>
<td><blockquote>
<p>String (100</p>
<p>chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Brief description</p>
</blockquote></td>
<td><blockquote>
<p>"What type of mentorship are you seeking/offering?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Mentorship Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Category</p>
</blockquote></td>
<td><blockquote>
<p>"What area of mentorship?" (Technical / Career Development / Business / Leadership / Project Management / Design / Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Experience Level</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Mentee's current level</p>
</blockquote></td>
<td><blockquote>
<p>"What is the mentee's experience level?" (Entry-Level / Junior / Mid-Level / Senior transitioning to leadership)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Target Skills</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Skills to develop</p>
</blockquote></td>
<td><blockquote>
<p>"What skills or knowledge should be developed?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Duration</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer (months)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Expected length</p>
</blockquote></td>
<td><blockquote>
<p>"How long should the mentorship last?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Frequency</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Meeting cadence</p>
</blockquote></td>
<td><blockquote>
<p>"How often will mentor and mentee meet?" (Weekly / Bi-Weekly / Monthly / As Needed)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Format</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How mentorship is delivered</p>
</blockquote></td>
<td><blockquote>
<p>"What format?" (In-Person / Virtual / Hybrid / On-Site Shadowing)</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 18%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 17%" />
<col style="width: 39%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Compensation</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Payment structure</p>
</blockquote></td>
<td><blockquote>
<p>"Will this be paid or unpaid?" (Unpaid / Paid Hourly / Paid Monthly / Barter)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Barter Offer</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (500 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Conditional</p>
</blockquote></td>
<td><blockquote>
<p>If barter</p>
</blockquote></td>
<td><blockquote>
<p>"What is offered in exchange?" (Only if Compensation = Barter)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Mentor Requirements</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Conditional</p>
</blockquote></td>
<td><blockquote>
<p>If seeking mentor</p>
</blockquote></td>
<td><blockquote>
<p>"What qualifications should the mentor have?" (Years of experience, specific expertise, certifications)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Mentee Background</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (500 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Conditional</p>
</blockquote></td>
<td><blockquote>
<p>If offering mentorship</p>
</blockquote></td>
<td><blockquote>
<p>"What is the mentee's background and goals?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Success Metrics</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>How success is measured</p>
</blockquote></td>
<td><blockquote>
<p>"How will you measure success?" (Skill development, project completion, career advancement, etc.)</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Metrics for Matching**

<table>
<colgroup>
<col style="width: 23%" />
<col style="width: 28%" />
<col style="width: 47%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Expertise Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match mentor's expertise to mentee's needs</p>
</blockquote></td>
<td><blockquote>
<p>Compatibility score based on mentor's skills vs. mentee's target skills</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Experience Gap</strong></p>
</blockquote></td>
<td><blockquote>
<p>Ensure appropriate experience difference</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (mentor's experience years &gt;= mentee's experience + 5 years)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Availability Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match scheduling preferences</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (mentor's availability aligns with mentee's preferred frequency/format)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Industry Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match sector-specific experience</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (mentor has experience in mentee's target industry)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Geographic Proximity</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prefer local mentors (if in- person)</p>
</blockquote></td>
<td><blockquote>
<p>Distance between mentor and mentee (km)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Past Mentorship Performance</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prioritize proven mentors</p>
</blockquote></td>
<td><blockquote>
<p>Average rating from past mentees (0-5)</p>
</blockquote></td>
</tr>
</tbody>
</table>

# Model 3: Resource Pooling & Sharing {#model-3-resource-pooling-sharing .unnumbered}

## Model Definition {#model-definition-2 .unnumbered}

> **Purpose:** Collaboration focused on pooling financial resources, co-owning assets, or sharing/exchanging excess resources to achieve cost savings, efficiency, and waste reduction.

### Core Characteristics: {#core-characteristics-2 .unnumbered}

- Resource-focused (not project-focused)

- Cost optimization and efficiency

- May involve co-ownership or temporary sharing

- Can include monetary and non-monetary exchanges

> **Applicability:** B2B, B2P (limited)

## Sub-Model 3.1: Bulk Purchasing {#sub-model-3.1-bulk-purchasing .unnumbered}

> **Description**
>
> Group buying where multiple parties pool their purchasing power to achieve volume discounts on materials, equipment, or services. Participants place a collective order, negotiate better pricing, and distribute goods after purchase.
>
> **Use Cases**

- Five small contractors pool orders to buy cement at bulk discount

- Multiple developers jointly purchase elevators for their projects

- Contractors collaborate to buy safety equipment in volume

- SMEs jointly procure software licenses at enterprise pricing

> **Applicability**

<table>
<colgroup>
<col style="width: 26%" />
<col style="width: 16%" />
<col style="width: 56%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Primary use case: companies pooling purchases</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>B2P</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Rare; typically companies, not individuals</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p>P2B</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Not applicable</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>P2P</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Possible for professionals buying tools/software</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Key Attributes**

<table>
<colgroup>
<col style="width: 19%" />
<col style="width: 14%" />
<col style="width: 12%" />
<col style="width: 18%" />
<col style="width: 35%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Product/Service</strong></p>
</blockquote></td>
<td><blockquote>
<p>String (150 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>What is being purchased</p>
</blockquote></td>
<td><blockquote>
<p>"What product or service do you want to buy in bulk?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Category</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Type of purchase</p>
</blockquote></td>
<td><blockquote>
<p>"What category?" (Materials / Equipment / Software / Services / Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Quantity Needed</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Total volume</p>
</blockquote></td>
<td><blockquote>
<p>"What total quantity do you need?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Unit of Measure</strong></p>
</blockquote></td>
<td><blockquote>
<p>String</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Measurement unit</p>
</blockquote></td>
<td><blockquote>
<p>"What is the unit of measure?" (Tons, Pieces, Licenses, etc.)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Target Price</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Desired price per unit</p>
</blockquote></td>
<td><blockquote>
<p>"What is your target price per unit?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Current Market Price</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Reference price</p>
</blockquote></td>
<td><blockquote>
<p>"What is the current market price?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Expected Savings</strong></p>
</blockquote></td>
<td><blockquote>
<p>Percentage</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Discount target</p>
</blockquote></td>
<td><blockquote>
<p>"What discount percentage are you targeting?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Delivery Timeline</strong></p>
</blockquote></td>
<td><blockquote>
<p>Date Range</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>When goods are needed</p>
</blockquote></td>
<td><blockquote>
<p>"When do you need delivery?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Delivery Location</strong></p>
</blockquote></td>
<td><blockquote>
<p>String</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Where goods will be delivered</p>
</blockquote></td>
<td><blockquote>
<p>"Where should goods be delivered?" (Single location / Multiple locations)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Payment Structure</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How payment is handled</p>
</blockquote></td>
<td><blockquote>
<p>"How will payment be structured?" (Upfront Collection / Escrow / Pay on Delivery / Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Participants Needed</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Number of buyers</p>
</blockquote></td>
<td><blockquote>
<p>"How many participants do you need?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Minimum Order</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Supplier's minimum</p>
</blockquote></td>
<td><blockquote>
<p>"What is the supplier's minimum order quantity?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Lead Organizer</strong></p>
</blockquote></td>
<td><blockquote>
<p>Boolean</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Is poster the organizer</p>
</blockquote></td>
<td><blockquote>
<p>"Will you organize this bulk purchase?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Supplier</strong></p>
</blockquote></td>
<td><blockquote>
<p>String</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Target supplier</p>
</blockquote></td>
<td><blockquote>
<p>"Do you have a preferred supplier?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Distribution Method</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How goods are distributed</p>
</blockquote></td>
<td><blockquote>
<p>"How will goods be distributed?" (Centralized Pickup / Individual Delivery / Organizer Distributes)</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Metrics for Matching**

<table>
<colgroup>
<col style="width: 21%" />
<col style="width: 30%" />
<col style="width: 48%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Quantity Alignment</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match participants with similar needs</p>
</blockquote></td>
<td><blockquote>
<p>Compatibility score based on quantity needed</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Timeline Alignment</strong></p>
</blockquote></td>
<td><blockquote>
<p>Ensure delivery timelines match</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (participant's timeline overlaps with group timeline)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Geographic Proximity</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prefer participants in same region</p>
</blockquote></td>
<td><blockquote>
<p>Distance from delivery location (km)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Payment Capacity</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify participant can pay their share</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (participant's budget &gt;= their share of total cost)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Reliability Score</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prioritize reliable participants</p>
</blockquote></td>
<td><blockquote>
<p>Average rating from past Bulk Purchasing collaborations (0-5)</p>
</blockquote></td>
</tr>
</tbody>
</table>

## Sub-Model 3.2: Co-Ownership Pooling {#sub-model-3.2-co-ownership-pooling .unnumbered}

> **Description**
>
> Multiple parties jointly purchase and co-own expensive equipment or assets, sharing the costs of acquisition, maintenance, insurance, and storage. Each co-owner has scheduled access to the asset.
>
> **Use Cases**

- Three contractors co-own a tower crane, sharing costs and usage

- Developers jointly purchase excavators and share across projects

- SMEs co-own a concrete batching plant

- Contractors jointly invest in surveying equipment (drones, laser scanners)

> **Applicability**

<table>
<colgroup>
<col style="width: 26%" />
<col style="width: 16%" />
<col style="width: 56%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Primary use case: companies co-owning assets</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>B2P</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Rare; typically companies, not individuals</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p>P2B</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Not applicable</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 26%" />
<col style="width: 16%" />
<col style="width: 56%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>P2P</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Possible for professionals co-owning tools</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Key Attributes**

<table>
<colgroup>
<col style="width: 19%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 19%" />
<col style="width: 36%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Asset Description</strong></p>
</blockquote></td>
<td><blockquote>
<p>String (150 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>What is being co- owned</p>
</blockquote></td>
<td><blockquote>
<p>"What asset do you want to co-own?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Asset Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Category</p>
</blockquote></td>
<td><blockquote>
<p>"What type of asset?" (Heavy Equipment / Vehicles / Tools / Technology / Facility / Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Purchase Price</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Total acquisition cost</p>
</blockquote></td>
<td><blockquote>
<p>"What is the purchase price?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Ownership Structure</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Legal arrangement</p>
</blockquote></td>
<td><blockquote>
<p>"How will ownership be structured?" (Equal Shares / Proportional to Investment / LLC / Partnership)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Number of Co- Owners</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Total owners</p>
</blockquote></td>
<td><blockquote>
<p>"How many co-owners?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Equity Per Owner</strong></p>
</blockquote></td>
<td><blockquote>
<p>Decimal</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Ownership percentage</p>
</blockquote></td>
<td><blockquote>
<p>"What percentage will each owner have?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Initial Investment</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Upfront cost per owner</p>
</blockquote></td>
<td><blockquote>
<p>"What is the initial investment per owner?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Ongoing Costs</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Maintenance, insurance, storage</p>
</blockquote></td>
<td><blockquote>
<p>"What are the ongoing costs?" (Maintenance, insurance, storage, operator)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Cost Sharing</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How costs are split</p>
</blockquote></td>
<td><blockquote>
<p>"How will ongoing costs be shared?" (Equally / Proportional to Usage / Proportional to Ownership)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Usage Schedule</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How access is allocated</p>
</blockquote></td>
<td><blockquote>
<p>"How will usage be scheduled?" (Rotation / Booking System / Priority by Ownership %)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Asset Location</strong></p>
</blockquote></td>
<td><blockquote>
<p>String</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Where asset is stored</p>
</blockquote></td>
<td><blockquote>
<p>"Where will the asset be located?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Maintenance Responsibility</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Who maintains</p>
</blockquote></td>
<td><blockquote>
<p>"Who is responsible for maintenance?" (Shared / Designated Owner / Third-Party Service)</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 19%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 19%" />
<col style="width: 36%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Insurance</strong></p>
</blockquote></td>
<td><blockquote>
<p>Boolean</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Is asset insured</p>
</blockquote></td>
<td><blockquote>
<p>"Will the asset be insured?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Exit Strategy</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How owners can exit</p>
</blockquote></td>
<td><blockquote>
<p>"How can an owner exit?" (Sell Share to Other Owners / Sell to Third Party / Liquidate Asset)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Dispute Resolution</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Conflict mechanism</p>
</blockquote></td>
<td><blockquote>
<p>"How will disputes be resolved?" (Arbitration / Mediation / Court)</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Metrics for Matching**

<table>
<colgroup>
<col style="width: 21%" />
<col style="width: 29%" />
<col style="width: 48%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Financial Capacity</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify participant can afford investment</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (participant's budget &gt;= required investment)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Usage Needs</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match usage requirements</p>
</blockquote></td>
<td><blockquote>
<p>Compatibility score based on usage frequency and duration</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Geographic Proximity</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prefer participants near asset location</p>
</blockquote></td>
<td><blockquote>
<p>Distance from asset location (km)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Reliability Score</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prioritize reliable co-owners</p>
</blockquote></td>
<td><blockquote>
<p>Average rating from past co-ownership arrangements (0-5)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Maintenance Capability</strong></p>
</blockquote></td>
<td><blockquote>
<p>Assess ability to maintain asset</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (participant has technical capability or budget for maintenance)</p>
</blockquote></td>
</tr>
</tbody>
</table>

## Sub-Model 3.3: Resource Sharing & Exchange {#sub-model-3.3-resource-sharing-exchange .unnumbered}

> **Description**
>
> Marketplace for selling, buying, renting, or bartering excess materials, equipment, labor, or services. This is PMTwin\'s differentiator: supporting **non-monetary exchanges** (barter, skill- for-skill, service-for-certification) alongside traditional transactions.
>
> **Use Cases**

- Contractor sells excess steel beams from completed project

- Company rents idle excavator to another contractor

- Developer exchanges surplus tiles for electrical materials

- Professional offers design services in exchange for project management training

- Company provides labor in exchange for equipment rental

> **Applicability**

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 16%" />
<col style="width: 58%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Primary use case: companies exchanging resources</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>B2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Companies can exchange with professionals</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p>P2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Professionals can offer services to companies</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>P2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Professionals can barter skills and services</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Key Attributes**

<table>
<colgroup>
<col style="width: 15%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 21%" />
<col style="width: 37%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Resource Title</strong></p>
</blockquote></td>
<td><blockquote>
<p>String (150</p>
<p>chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Brief description</p>
</blockquote></td>
<td><blockquote>
<p>"What resource are you offering/seeking?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Resource Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Category</p>
</blockquote></td>
<td><blockquote>
<p>"What type of resource?" (Materials / Equipment / Labor / Services / Knowledge / Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Transaction Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How resource is exchanged</p>
</blockquote></td>
<td><blockquote>
<p>"What type of transaction?" (Sell / Buy</p>
<p>/ Rent / Barter / Donate)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Detailed Description</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (1000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Full details</p>
</blockquote></td>
<td><blockquote>
<p>"Provide detailed description" (Condition, specifications, quantity, etc.)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Quantity</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Amount available/needed</p>
</blockquote></td>
<td><blockquote>
<p>"What quantity?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Unit of Measure</strong></p>
</blockquote></td>
<td><blockquote>
<p>String</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Measurement unit</p>
</blockquote></td>
<td><blockquote>
<p>"What is the unit?" (Pieces, Tons, Hours, Days, etc.)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Condition</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Conditional</p>
</blockquote></td>
<td><blockquote>
<p>If equipment/materials</p>
</blockquote></td>
<td><blockquote>
<p>"What condition?" (New / Like New / Good / Fair / Poor)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Location</strong></p>
</blockquote></td>
<td><blockquote>
<p>String</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Where resource is located</p>
</blockquote></td>
<td><blockquote>
<p>"Where is the resource located?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Availability</strong></p>
</blockquote></td>
<td><blockquote>
<p>Date Range</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>When available</p>
</blockquote></td>
<td><blockquote>
<p>"When is this available?"</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 15%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 21%" />
<col style="width: 37%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Price</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency</p>
</blockquote></td>
<td><blockquote>
<p>Conditional</p>
</blockquote></td>
<td><blockquote>
<p>If selling/renting</p>
</blockquote></td>
<td><blockquote>
<p>"What is your asking price?" (Per unit, per day, total)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Barter Offer</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (1000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Conditional</p>
</blockquote></td>
<td><blockquote>
<p>If bartering</p>
</blockquote></td>
<td><blockquote>
<p>"What are you willing to accept in exchange?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Barter Preferences</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Enums</p>
</blockquote></td>
<td><blockquote>
<p>Conditional</p>
</blockquote></td>
<td><blockquote>
<p>If bartering</p>
</blockquote></td>
<td><blockquote>
<p>"What types of resources are you interested in?" (Materials / Equipment / Labor / Services / Knowledge / Certification / Other)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Delivery</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Who handles delivery</p>
</blockquote></td>
<td><blockquote>
<p>"Who handles delivery?" (Buyer Pickup</p>
<p>/ Seller Delivery / Negotiable)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Payment Terms</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Conditional</p>
</blockquote></td>
<td><blockquote>
<p>If monetary</p>
</blockquote></td>
<td><blockquote>
<p>"What are the payment terms?" (Upfront / On Delivery / Installments)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Urgency</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How urgent</p>
</blockquote></td>
<td><blockquote>
<p>"How urgent is this?" (Immediate / Within 1 Week / Within 1 Month / Flexible)</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Metrics for Matching**

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 27%" />
<col style="width: 47%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Resource Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match offered resources to needs</p>
</blockquote></td>
<td><blockquote>
<p>Compatibility score based on resource type, quantity, specifications</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Barter Compatibility</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match barter offers to preferences</p>
</blockquote></td>
<td><blockquote>
<p>Compatibility score: what's offered vs. what's wanted</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Geographic Proximity</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prefer local exchanges</p>
</blockquote></td>
<td><blockquote>
<p>Distance between parties (km)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Timeline Alignment</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match availability to urgency</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (resource available when needed)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Price Compatibility</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match price expectations</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (asking price within buyer's budget)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Condition Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match condition requirements</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (resource condition meets buyer's minimum)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Past Exchange Performance</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prioritize reliable traders</p>
</blockquote></td>
<td><blockquote>
<p>Average rating from past Resource Sharing exchanges (0-5)</p>
</blockquote></td>
</tr>
</tbody>
</table>

# Model 4: Hiring a Resource {#model-4-hiring-a-resource .unnumbered}

## Model Definition {#model-definition-3 .unnumbered}

> **Purpose:** Recruiting professionals or consultants for employment or service engagements.

### Core Characteristics: {#core-characteristics-3 .unnumbered}

- Employer-employee or client-consultant relationship

- Labor or expertise acquisition (not partnership)

- Defined role and responsibilities

- Compensation-based (salary, fees, or barter)

> **Applicability:** B2P, P2B

## Sub-Model 4.1: Professional Hiring {#sub-model-4.1-professional-hiring .unnumbered}

> **Description**
>
> Full-time, part-time, or contract employment of professionals for ongoing work. This is traditional hiring for roles like engineers, project managers, site supervisors, quantity surveyors, etc.
>
> **Use Cases**

- Company hires full-time civil engineer

- Contractor hires project manager on 12-month contract

- Developer hires part-time quantity surveyor

- Company hires site supervisor for specific project duration

> **Applicability**

<table>
<colgroup>
<col style="width: 26%" />
<col style="width: 16%" />
<col style="width: 56%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2B</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Not applicable (hiring is B2P or P2B)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>B2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Primary use case: company hires professional</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p>P2B</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Rare; professionals usually don't hire companies</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>P2P</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Possible for senior professionals hiring assistants</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Key Attributes**

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 20%" />
<col style="width: 36%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Job Title</strong></p>
</blockquote></td>
<td><blockquote>
<p>String (100</p>
<p>chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Position title</p>
</blockquote></td>
<td><blockquote>
<p>"What is the job title?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Job Category</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Type of role</p>
</blockquote></td>
<td><blockquote>
<p>"What category?" (Engineering / Project Management / Architecture / Quantity Surveying / Site Supervision</p>
<p>/ Safety / Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Employment Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Type of employment</p>
</blockquote></td>
<td><blockquote>
<p>"What type of employment?" (Full- Time / Part-Time / Contract / Freelance / Temporary)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Contract Duration</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer (months)</p>
</blockquote></td>
<td><blockquote>
<p>Conditional</p>
</blockquote></td>
<td><blockquote>
<p>If contract/temp</p>
</blockquote></td>
<td><blockquote>
<p>"How long is the contract?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Job Description</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (2000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Full responsibilities</p>
</blockquote></td>
<td><blockquote>
<p>"Describe the role and responsibilities"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Required Qualifications</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Education, certifications</p>
</blockquote></td>
<td><blockquote>
<p>"What qualifications are required?" (Degree, certifications, licenses)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Required Experience</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer (years)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Years of experience</p>
</blockquote></td>
<td><blockquote>
<p>"How many years of experience required?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Required Skills</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Technical skills</p>
</blockquote></td>
<td><blockquote>
<p>"What skills are required?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Preferred Skills</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Nice-to-have skills</p>
</blockquote></td>
<td><blockquote>
<p>"What skills are preferred but not required?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Location</strong></p>
</blockquote></td>
<td><blockquote>
<p>String</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Work location</p>
</blockquote></td>
<td><blockquote>
<p>"Where is the job located?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Work Mode</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>On-site vs. remote</p>
</blockquote></td>
<td><blockquote>
<p>"What is the work mode?" (On-Site / Remote / Hybrid)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Salary Range</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency Range</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Compensation</p>
</blockquote></td>
<td><blockquote>
<p>"What is the salary range?" (Monthly or annual)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Benefits</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Additional benefits</p>
</blockquote></td>
<td><blockquote>
<p>"What benefits are offered?" (Health insurance, housing, transportation, etc.)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Start Date</strong></p>
</blockquote></td>
<td><blockquote>
<p>Date</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>When role starts</p>
</blockquote></td>
<td><blockquote>
<p>"When should the employee start?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Reporting To</strong></p>
</blockquote></td>
<td><blockquote>
<p>String</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Manager/supervisor</p>
</blockquote></td>
<td><blockquote>
<p>"Who will this person report to?"</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 20%" />
<col style="width: 36%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Team Size</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Size of team</p>
</blockquote></td>
<td><blockquote>
<p>"How large is the team?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Application Deadline</strong></p>
</blockquote></td>
<td><blockquote>
<p>Date</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Deadline to apply</p>
</blockquote></td>
<td><blockquote>
<p>"What is the application deadline?"</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Metrics for Matching**

<table style="width:100%;">
<colgroup>
<col style="width: 22%" />
<col style="width: 32%" />
<col style="width: 44%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Qualification Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify required qualifications</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (candidate has required education and certifications)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Experience Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify experience level</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (candidate's years of experience &gt;= required)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Skill Match Score</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match required skills to candidate's profile</p>
</blockquote></td>
<td><blockquote>
<p>(Matching Skills / Required Skills) × 100</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Location Compatibility</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match location preferences</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (candidate willing to work in job location)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Salary Compatibility</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match salary expectations</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (candidate's expected salary within offered range)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Availability Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Ensure candidate can start on time</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (candidate available by start date)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Past Performance Score</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prioritize high-performing candidates</p>
</blockquote></td>
<td><blockquote>
<p>Average rating from past employers (0-5)</p>
</blockquote></td>
</tr>
</tbody>
</table>

## Sub-Model 4.2: Consultant Hiring {#sub-model-4.2-consultant-hiring .unnumbered}

> **Description**
>
> Engaging consultants for advisory services, expert opinions, specialized analysis, or short- term professional services. Consultants are typically hired for their expertise rather than labor.
>
> **Use Cases**

- Hiring legal consultant to review contracts

- Engaging sustainability consultant for green building certification

- Hiring financial advisor for project finance structuring

- Engaging BIM consultant to implement digital workflows

- Hiring safety consultant for risk assessment

> **Applicability**

<table>
<colgroup>
<col style="width: 24%" />
<col style="width: 15%" />
<col style="width: 59%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2B</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Companies can hire consulting firms</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>B2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Primary use case: company hires individual consultant</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p>P2B</p>
</blockquote></td>
<td><blockquote>
<p>Limited</p>
</blockquote></td>
<td><blockquote>
<p>Professionals can hire consulting firms</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>P2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Professionals can hire other professionals for consulting</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Key Attributes**

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 15%" />
<col style="width: 12%" />
<col style="width: 17%" />
<col style="width: 37%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Consultation Title</strong></p>
</blockquote></td>
<td><blockquote>
<p>String (100 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Brief description</p>
</blockquote></td>
<td><blockquote>
<p>"What type of consultation do you need?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Consultation Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Category</p>
</blockquote></td>
<td><blockquote>
<p>"What area of consultation?" (Legal / Financial / Technical / Sustainability / Safety / Design / Project Management</p>
<p>/ Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Scope of Work</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (2000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Detailed description</p>
</blockquote></td>
<td><blockquote>
<p>"Describe the scope of work"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Deliverables</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Expected outputs</p>
</blockquote></td>
<td><blockquote>
<p>"What deliverables do you expect?" (Report, analysis, recommendations, training, etc.)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Duration</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer (days/weeks)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Expected timeline</p>
</blockquote></td>
<td><blockquote>
<p>"How long will this consultation take?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Required Expertise</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Specific expertise needed</p>
</blockquote></td>
<td><blockquote>
<p>"What expertise is required?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Required Certifications</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Certifications needed</p>
</blockquote></td>
<td><blockquote>
<p>"What certifications are required?" (e.g., LEED AP, PMP, etc.)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Experience Level</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Seniority required</p>
</blockquote></td>
<td><blockquote>
<p>"What experience level?" (Mid-Level / Senior / Expert)</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 17%" />
<col style="width: 15%" />
<col style="width: 12%" />
<col style="width: 17%" />
<col style="width: 37%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Location Requirement</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>On-site vs. remote</p>
</blockquote></td>
<td><blockquote>
<p>"Does this require on-site presence?" (Remote / On-Site / Hybrid)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Budget</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency Range</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Compensation</p>
</blockquote></td>
<td><blockquote>
<p>"What is your budget?" (Fixed fee, hourly rate, or range)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Payment Terms</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Payment structure</p>
</blockquote></td>
<td><blockquote>
<p>"What are the payment terms?" (Upfront / Milestone-Based / Upon Completion)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Start Date</strong></p>
</blockquote></td>
<td><blockquote>
<p>Date</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>When work should begin</p>
</blockquote></td>
<td><blockquote>
<p>"When do you need this to start?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Exchange Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Monetary or barter</p>
</blockquote></td>
<td><blockquote>
<p>"How will you compensate?" (Cash / Barter / Mixed)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Barter Offer</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (500 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Conditional</p>
</blockquote></td>
<td><blockquote>
<p>If barter</p>
</blockquote></td>
<td><blockquote>
<p>"What are you offering in exchange?"</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Metrics for Matching**

<table>
<colgroup>
<col style="width: 21%" />
<col style="width: 31%" />
<col style="width: 46%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Metric</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Purpose</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Calculation</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Expertise Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match required expertise to consultant's profile</p>
</blockquote></td>
<td><blockquote>
<p>Compatibility score based on consultant's expertise vs. required expertise</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Experience Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify experience level</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (consultant's experience level &gt;= required)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Certification Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Verify required certifications</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (consultant has required certifications)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Availability Match</strong></p>
</blockquote></td>
<td><blockquote>
<p>Ensure consultant is available</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (consultant available during required dates)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Budget Compatibility</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match budget to consultant's rates</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (consultant's rate within budget range)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Location Compatibility</strong></p>
</blockquote></td>
<td><blockquote>
<p>Match location requirements</p>
</blockquote></td>
<td><blockquote>
<p>Boolean (consultant can work in required location/mode)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Past Performance Score</strong></p>
</blockquote></td>
<td><blockquote>
<p>Prioritize high-performing consultants</p>
</blockquote></td>
<td><blockquote>
<p>Average rating from past clients (0-5)</p>
</blockquote></td>
</tr>
</tbody>
</table>

# Model 5: Call for Competition {#model-5-call-for-competition .unnumbered}

## Model Definition {#model-definition-4 .unnumbered}

> **Purpose:** Competitive sourcing of solutions, designs, or talent through open or invited competitions.

### Core Characteristics: {#core-characteristics-4 .unnumbered}

- Competitive selection process

- Multiple participants submit proposals

- Winner(s) selected based on criteria

- Transparent evaluation

> **Applicability:** B2B, B2P, P2B, P2P

## Sub-Model 5.1: Competition/RFP {#sub-model-5.1-competitionrfp .unnumbered}

> **Description**
>
> Open or invited competitions where multiple parties (companies or professionals) compete for contracts, projects, or recognition. This includes design competitions, RFPs (Request for Proposal), RFQs (Request for Quotation), and solution challenges.
>
> **Use Cases**

- Developer launches design competition for landmark building

- Government issues RFP for infrastructure project

- Company issues RFQ for construction materials supply

- Developer runs competition for sustainable building solutions

- Professional association hosts innovation challenge

> **Applicability**

<table>
<colgroup>
<col style="width: 24%" />
<col style="width: 15%" />
<col style="width: 60%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>B2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Companies compete for contracts</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p>B2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Companies compete, professionals evaluate; or vice versa</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p>P2B</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Professionals compete for company contracts</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 24%" />
<col style="width: 15%" />
<col style="width: 60%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Relationship Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Supported</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Notes</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p>P2P</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Professionals compete for recognition or projects</p>
</blockquote></td>
</tr>
</tbody>
</table>

> **Key Attributes**

<table>
<colgroup>
<col style="width: 19%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 18%" />
<col style="width: 36%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Competition Title</strong></p>
</blockquote></td>
<td><blockquote>
<p>String (150 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Name of competition</p>
</blockquote></td>
<td><blockquote>
<p>"What is the competition title?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Competition Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Category</p>
</blockquote></td>
<td><blockquote>
<p>"What type of competition?" (Design Competition / RFP / RFQ / Solution Challenge / Innovation Contest / Other)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Competition Scope</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (2000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>What is being competed for</p>
</blockquote></td>
<td><blockquote>
<p>"Describe the scope of the competition"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Participant Type</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Who can participate</p>
</blockquote></td>
<td><blockquote>
<p>"Who can participate?" (Companies Only / Professionals Only / Both)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Competition Format</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Open vs. invited</p>
</blockquote></td>
<td><blockquote>
<p>"What format?" (Open to All / Invited Only / Prequalified Participants)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Eligibility Criteria</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Requirements to participate</p>
</blockquote></td>
<td><blockquote>
<p>"What are the eligibility criteria?" (Experience, certifications, financial capacity, etc.)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Submission Requirements</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Strings</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>What participants must submit</p>
</blockquote></td>
<td><blockquote>
<p>"What must participants submit?" (Proposal, design, technical solution, pricing, etc.)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Evaluation Criteria</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Objects</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How submissions are judged</p>
</blockquote></td>
<td><blockquote>
<p>"What are the evaluation criteria?" (Technical quality, price, innovation, sustainability, etc.)</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Evaluation Weights</strong></p>
</blockquote></td>
<td><blockquote>
<p>Array of Decimals</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Importance of each criterion</p>
</blockquote></td>
<td><blockquote>
<p>"What is the weight of each criterion?" (e.g., Technical 40%, Price 30%,</p>
<p>Experience 20%, Innovation 10%)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Prize/Contract Value</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Value of award</p>
</blockquote></td>
<td><blockquote>
<p>"What is the prize or contract value?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Number of Winners</strong></p>
</blockquote></td>
<td><blockquote>
<p>Integer</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>How many winners</p>
</blockquote></td>
<td><blockquote>
<p>"How many winners will be selected?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Submission Deadline</strong></p>
</blockquote></td>
<td><blockquote>
<p>Date</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Deadline to submit</p>
</blockquote></td>
<td><blockquote>
<p>"What is the submission deadline?"</p>
</blockquote></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 19%" />
<col style="width: 12%" />
<col style="width: 12%" />
<col style="width: 18%" />
<col style="width: 36%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Attribute</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Data Type</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Required</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Description</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Chatbot Question</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><blockquote>
<p><strong>Announcement Date</strong></p>
</blockquote></td>
<td><blockquote>
<p>Date</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>When winners are announced</p>
</blockquote></td>
<td><blockquote>
<p>"When will winners be announced?"</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Competition Rules</strong></p>
</blockquote></td>
<td><blockquote>
<p>Text (2000 chars)</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>Terms and conditions</p>
</blockquote></td>
<td><blockquote>
<p>"What are the competition rules?"</p>
</blockquote></td>
</tr>
<tr class="odd">
<td><blockquote>
<p><strong>Intellectual Property</strong></p>
</blockquote></td>
<td><blockquote>
<p>Enum</p>
</blockquote></td>
<td><blockquote>
<p>Yes</p>
</blockquote></td>
<td><blockquote>
<p>IP ownership</p>
</blockquote></td>
<td><blockquote>
<p>"Who owns the IP of submissions?" (Submitter Retains / Client Owns / Shared / Winner Transfers)</p>
</blockquote></td>
</tr>
<tr class="even">
<td><blockquote>
<p><strong>Submission Fee</strong></p>
</blockquote></td>
<td><blockquote>
<p>Currency</p>
</blockquote></td>
<td><blockquote>
<p>No</p>
</blockquote></td>
<td><blockquote>
<p>Fee to participate</p>
</blockquote></td>
<td><blockquote>
<p>"Is there a submission fee?"</p>
</blockquote></td>
</tr>
</tbody>
</table>
