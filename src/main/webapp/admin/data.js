window.BIOMED_ADMIN_DATA = {
  version: "0.1.0",
  deployment: {
    target: "Cloudflare Pages",
    storageMode: "Microsoft 365 / OneDrive for Business",
    signInMode: "Single-tenant Entra ID"
  },
  snapshot: [
    {
      label: "Custom libraries loaded",
      value: "5",
      note: "ISO 5807, Quality System, Lab Templates, Antibody Process, CAR-T Process"
    },
    {
      label: "Preset components",
      value: "64",
      note: "Total presets across all custom libraries"
    },
    {
      label: "Tooltip sets ready",
      value: "2 / 2",
      note: "ISO 5807 and biomed tooltip review sets marked ready"
    },
    {
      label: "Usage tracking mode",
      value: "Manual",
      note: "Telemetry not connected in the MVP"
    }
  ],
  libraries: [
    {
      id: "iso5807",
      title: "ISO 5807",
      version: "0.1.0",
      presets: 19,
      tooltipStatus: "ready",
      source: "custom-libraries/iso5807.xml"
    },
    {
      id: "quality-system",
      title: "Quality System",
      version: "0.1.0",
      presets: 10,
      tooltipStatus: "ready",
      source: "custom-libraries/quality-system.xml"
    },
    {
      id: "lab-templates",
      title: "Lab Templates",
      version: "0.1.0",
      presets: 7,
      tooltipStatus: "ready",
      source: "custom-libraries/lab-templates.xml"
    },
    {
      id: "antibody-process",
      title: "Antibody Process",
      version: "0.1.0",
      presets: 15,
      tooltipStatus: "ready",
      source: "custom-libraries/antibody-process.xml"
    },
    {
      id: "cart-process",
      title: "CAR-T Process",
      version: "0.1.0",
      presets: 13,
      tooltipStatus: "ready",
      source: "custom-libraries/cart-process.xml"
    }
  ],
  usage: [
    {
      metric: "Production telemetry",
      value: "Not connected",
      source: "MVP guardrail to avoid extra paid services"
    },
    {
      metric: "Primary adoption proxy",
      value: "Count of .drawio files in company OneDrive",
      source: "PRD adoption KPI"
    },
    {
      metric: "Reporting cadence",
      value: "Manual monthly review",
      source: "Admin dashboard registry"
    },
    {
      metric: "PPTX export mode",
      value: "Manual SVG to PowerPoint conversion",
      source: "ADR-005 export strategy"
    }
  ],
  groups: [
    {
      name: "Tenant-wide company accounts",
      access: "Editor sign-in",
      status: "active",
      notes: "Enforced by single-tenant Entra ID configuration"
    },
    {
      name: "Biomed Flowchart Admins",
      access: "Admin dashboard review",
      status: "view-only registry",
      notes: "No page-side group enforcement in the MVP"
    },
    {
      name: "Library Reviewers",
      access: "Content review coordination",
      status: "view-only registry",
      notes: "Used for operational handoff, not runtime authorization"
    }
  ]
};
