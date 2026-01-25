# PMTwin MVP - Proof of Concept

A comprehensive collaboration platform for the construction industry, enabling partnerships, resource sharing, and professional connections across Saudi Arabia and the GCC region.

## Project Overview

PMTwin facilitates collaboration between construction companies, professionals, and stakeholders through multiple partnership models:

- **Project-Based Collaboration**: Task-based engagements, consortiums, joint ventures, SPVs
- **Strategic Partnerships**: Long-term JVs, strategic alliances, mentorship programs
- **Resource Pooling**: Bulk purchasing, equipment sharing, resource exchange
- **Hiring**: Professional hiring and consultant engagement
- **Competitions**: RFPs, RFQs, design competitions

## Architecture

- **Type**: Feature-Based Multi-Page Application (MPA)
- **Stack**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage**: localStorage (POC phase)
- **No frameworks**: Pure vanilla implementation for POC

## Project Structure

```
PMTwin-MVP/
├── BRD/                    # Business Requirements Documentation
├── docs/                   # Additional documentation
├── POC/                    # Proof of Concept Application
│   ├── index.html         # Entry point
│   ├── pages/             # Feature pages
│   ├── features/          # Feature components
│   ├── src/               # Source code
│   ├── assets/            # Static assets
│   ├── data/              # Seed data
│   └── templates/         # HTML templates
└── README.md
```

## Getting Started

1. Open `POC/index.html` in a modern web browser
2. No build process required - pure HTML/CSS/JS
3. All data persists in browser localStorage

## User Roles

- **Company Roles**: Owner, Admin, Member
- **Professional Roles**: Professional, Consultant
- **Admin Roles**: Platform Admin, Moderator, Auditor

## Features

- 26+ features across 3 portals
- 5 business models with 13 sub-models
- AI-powered collaboration wizard
- Matching and recommendation engine
- Application workflow with Kanban pipeline
- Admin portal for governance

## Documentation

See `BRD/` directory for comprehensive business requirements and specifications.

## License

Proprietary - PMTwin Platform
